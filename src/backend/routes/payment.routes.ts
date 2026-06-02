import { Router } from 'express';
import { query } from '../config/db';
import { authenticateToken } from '../middleware/auth';
import { v4 as uuidv4 } from 'uuid';
import { validateRequest } from '../middleware/validation';
import { sanitizeRequest } from '../middleware/sanitization';
import { z } from 'zod';
import { createNotification, createAdminNotification } from '../utils/notifications';

const router = Router();
router.use(sanitizeRequest);

const initiatePaymentSchema = z.object({
  body: z.object({
    doctorId: z.string().uuid(),
    packageMinutes: z.number().int().min(1).max(120),
    paymentMethod: z.enum(['bkash', 'nagad', 'card'])
  })
});

const completePaymentSchema = z.object({
  body: z.object({
    sessionId: z.string().uuid()
  })
});

// Configure static fees for simplicity (could be from doctors config)
const packageFees: Record<number, number> = {
  10: 500,
  20: 800,
  30: 1000,
  60: 1500
};

router.post('/initiate', authenticateToken, validateRequest(initiatePaymentSchema), async (req: any, res: any) => {
  try {
    const { doctorId, packageMinutes, paymentMethod } = req.body;
    const patientId = req.user.id;

    if (!packageFees[packageMinutes]) {
      await createAdminNotification('PAYMENT_ISSUE', `Invalid package minutes (${packageMinutes}) requested by user ${req.user.id}`);
      return res.status(400).json({ error: 'Invalid package minutes' });
    }

    const fee = packageFees[packageMinutes];
    
    // Create pending session
    const sessionId = uuidv4();
    await query(
      `INSERT INTO paid_sessions (id, patient_id, doctor_id, package_minutes, amount, status, payment_method, payment_status, created_at) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())`,
       [sessionId, patientId, doctorId, packageMinutes, fee, 'pending', paymentMethod, 'pending']
    );

    // Mock payment gateway completion
    // In a real app we'd redirect to bKash/Nagad
    res.json({
      success: true,
      sessionId,
      amount: fee,
      message: 'Payment initiated'
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/complete', authenticateToken, validateRequest(completePaymentSchema), async (req: any, res: any) => {
  try {
    const { sessionId } = req.body;
    
    // Mock successful payment
    const sessionRes = await query('SELECT * FROM paid_sessions WHERE id = $1 AND patient_id = $2', [sessionId, req.user.id]);
    if (sessionRes.rowCount === 0) return res.status(404).json({ error: 'Session not found or unauthorized' });
    
    const now = Math.floor(Date.now() / 1000);
    await query(
      `UPDATE paid_sessions SET payment_status = $1, status = $2, start_time = $3 WHERE id = $4`,
      ['paid', 'active', now, sessionId]
    );

    const session = sessionRes.rows[0];
    await createNotification(req.user.id, 'PAYMENT_SUCCESS', `Your payment of ৳${session.amount} for consultation was successful.`);
    await createNotification(session.doctor_id, 'NEW_CONSULTATION', `New consultation requested inside instant chat.`);

    res.json({ success: true, message: 'Payment completed successfully', sessionId });
  } catch (error: any) {
     res.status(500).json({ error: error.message });
  }
});

export default router;
