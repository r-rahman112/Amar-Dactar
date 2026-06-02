import { Router } from 'express';
import { query } from '../config/db';
import { authenticateToken, isAdmin } from '../middleware/auth';
import { v4 as uuidv4 } from 'uuid';
import { createNotification } from '../utils/notifications';

const router = Router();

// Get all verification requests
router.get('/doctor-verifications', authenticateToken, isAdmin, async (req: any, res) => {
  try {
    const result = await query(`
      SELECT v.*, d.fullName, d.degree, d.specialty
      FROM doctor_verifications v
      JOIN doctors d ON v.doctor_id = d.id
      ORDER BY v.created_at DESC
    `);
    res.json(result.rows);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Update verification status
router.patch('/doctor-verifications/:id', authenticateToken, isAdmin, async (req: any, res) => {
  try {
    const { id } = req.params; // this is doctor_id
    const { status, rejection_reason } = req.body;
    
    await query(`
      UPDATE doctor_verifications
      SET status = $1, rejection_reason = $2, updated_at = CURRENT_TIMESTAMP
      WHERE doctor_id = $3
    `, [status, rejection_reason || null, id]);

    await query(`
      UPDATE doctors
      SET verification_status = $1
      WHERE id = $2
    `, [status, id]);

    // Send Notification to Doctor
    let message = '';
    if (status === 'Verified') {
      message = 'Congratulations! Your doctor profile has been verified.';
    } else if (status === 'Rejected') {
      message = `Your verification request was rejected. Reason: ${rejection_reason}`;
    } else if (status === 'Suspended') {
      message = 'Your doctor profile has been suspended by administration.';
    }

    if (message) {
      await createNotification(id, 'VERIFICATION_UPDATE', message);
    }
    
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Get consent history
router.get('/consents', authenticateToken, isAdmin, async (req: any, res) => {
  try {
    const result = await query(`
      SELECT c.*, u.fullName, u.email
      FROM consents c
      JOIN users u ON c.user_id = u.id
      ORDER BY c.consent_timestamp DESC
    `);
    res.json(result.rows);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
