import { Router } from 'express';
import { query } from '../config/db';
import { authenticateToken } from '../middleware/auth';
import { validateRequest } from '../middleware/validation';
import { sanitizeRequest } from '../middleware/sanitization';
import { isDoctor } from '../middleware/roles';
import { z } from 'zod';

const router = Router();

const doctorSearchSchema = z.object({
  query: z.object({
    specialty: z.string().max(100).optional()
  })
});

router.use(sanitizeRequest);

router.get('/search', authenticateToken, validateRequest(doctorSearchSchema), async (req, res) => {
  try {
    const { specialty } = req.query as { specialty?: string };
    let result;
    if (specialty) {
      // Fuzzy matching on specialty
      result = await query("SELECT * FROM doctors WHERE specialty ILIKE $1 AND verification_status = 'Verified'", [`%${specialty}%`]);
    } else {
      result = await query("SELECT * FROM doctors WHERE verification_status = 'Verified'");
    }
    res.json(result.rows);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

const verificationSchema = z.object({
  body: z.object({
    bmdc_cert_url: z.string().url('Invalid URL format'),
    degree_cert_url: z.string().url('Invalid URL format'),
    nid_front_url: z.string().url('Invalid URL format'),
    nid_back_url: z.string().url('Invalid URL format'),
    photo_url: z.string().url('Invalid URL format')
  })
});

router.post('/verify/upload', authenticateToken, isDoctor, validateRequest(verificationSchema), async (req: any, res) => {
  try {
    const doctorId = req.user.id;
    const { bmdc_cert_url, degree_cert_url, nid_front_url, nid_back_url, photo_url } = req.body;
    
    await query(`
      INSERT INTO doctor_verifications (doctor_id, status, bmdc_cert_url, degree_cert_url, nid_front_url, nid_back_url, photo_url)
      VALUES ($1, 'Under Review', $2, $3, $4, $5, $6)
      ON CONFLICT (doctor_id) DO UPDATE SET
        status = 'Under Review',
        bmdc_cert_url = EXCLUDED.bmdc_cert_url,
        degree_cert_url = EXCLUDED.degree_cert_url,
        nid_front_url = EXCLUDED.nid_front_url,
        nid_back_url = EXCLUDED.nid_back_url,
        photo_url = EXCLUDED.photo_url,
        rejection_reason = NULL,
        updated_at = CURRENT_TIMESTAMP
    `, [doctorId, bmdc_cert_url, degree_cert_url, nid_front_url, nid_back_url, photo_url]);

    await query("UPDATE doctors SET verification_status = 'Under Review' WHERE id = $1", [doctorId]);
    
    res.json({ success: true, message: 'Verification documents submitted successfully' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/verify/status', authenticateToken, isDoctor, async (req: any, res) => {
  try {
    const doctorId = req.user.id;
    const verifiedStatus = await query("SELECT verification_status FROM doctors WHERE id = $1", [doctorId]);
    const details = await query("SELECT * FROM doctor_verifications WHERE doctor_id = $1", [doctorId]);
    
    res.json({
      status: verifiedStatus.rows[0]?.verification_status || 'Pending',
      details: details.rows[0] || null
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});


// Dashboard statistics
router.get('/dashboard/stats', authenticateToken, isDoctor, async (req: any, res) => {
  try {
    const doctorId = req.user.id;
    // Today's boundaries
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    // active sessions
    const activeResult = await query(
      "SELECT COUNT(*) FROM paid_sessions WHERE doctor_id = $1 AND status = 'active'",
      [doctorId]
    );

    // today's appointments (paid sessions created today)
    const todayApptResult = await query(
      "SELECT COUNT(*) FROM paid_sessions WHERE doctor_id = $1 AND created_at >= $2 AND created_at <= $3",
      [doctorId, todayStart.toISOString(), todayEnd.toISOString()]
    );

    // earnings (total) vs daily
    const dailyEarningsRes = await query(
      "SELECT COALESCE(SUM(amount), 0) as total FROM paid_sessions WHERE doctor_id = $1 AND payment_status = 'paid' AND created_at >= $2 AND created_at <= $3",
      [doctorId, todayStart.toISOString(), todayEnd.toISOString()]
    );
    const weeklyStart = new Date(todayStart);
    weeklyStart.setDate(weeklyStart.getDate() - 7);
    const weeklyEarningsRes = await query(
      "SELECT COALESCE(SUM(amount), 0) as total FROM paid_sessions WHERE doctor_id = $1 AND payment_status = 'paid' AND created_at >= $2 AND created_at <= $3",
      [doctorId, weeklyStart.toISOString(), todayEnd.toISOString()]
    );

    const monthlyStart = new Date(todayStart);
    monthlyStart.setMonth(monthlyStart.getMonth() - 1);
    const monthlyEarningsRes = await query(
      "SELECT COALESCE(SUM(amount), 0) as total FROM paid_sessions WHERE doctor_id = $1 AND payment_status = 'paid' AND created_at >= $2 AND created_at <= $3",
      [doctorId, monthlyStart.toISOString(), todayEnd.toISOString()]
    );

    res.json({
      activeConsultations: parseInt(activeResult.rows[0].count),
      todayAppointments: parseInt(todayApptResult.rows[0].count),
      earnings: {
        daily: parseInt(dailyEarningsRes.rows[0].total),
        weekly: parseInt(weeklyEarningsRes.rows[0].total),
        monthly: parseInt(monthlyEarningsRes.rows[0].total),
        withdrawable: parseInt(monthlyEarningsRes.rows[0].total) // mock
      }
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Get consultation requests / patients
router.get('/dashboard/patients', authenticateToken, isDoctor, async (req: any, res) => {
  try {
    const doctorId = req.user.id;
    const result = await query(`
      SELECT 
        ps.id as session_id,
        ps.status,
        ps.package_minutes,
        ps.amount,
        ps.created_at,
        u.id as patient_id,
        u.fullname as patient_name
      FROM paid_sessions ps
      JOIN users u ON ps.patient_id = u.id
      WHERE ps.doctor_id = $1
      ORDER BY ps.created_at DESC
    `, [doctorId]);
    res.json(result.rows);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
