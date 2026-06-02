import { Router } from 'express';
import { query } from '../config/db';
import { authenticateToken, isDoctor } from '../middleware/auth';
import { v4 as uuidv4 } from 'uuid';
import { z } from 'zod';
import { validateRequest } from '../middleware/validation';

const router = Router();

// ===================== DOCTOR API =====================

// Get schedule
router.get('/schedule', authenticateToken, isDoctor, async (req: any, res) => {
  try {
    const doctorId = req.user.id;
    const result = await query('SELECT * FROM doctor_schedules WHERE doctor_id = $1', [doctorId]);
    res.json(result.rows[0] || null);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Update schedule
const updateScheduleSchema = z.object({
  body: z.object({
    available_days: z.array(z.string()),
    start_time: z.string(),
    end_time: z.string(),
    duration_minutes: z.number().int().positive(),
    blocked_dates: z.array(z.string())
  })
});

router.post('/schedule', authenticateToken, isDoctor, validateRequest(updateScheduleSchema), async (req: any, res) => {
  try {
    const doctorId = req.user.id;
    const { available_days, start_time, end_time, duration_minutes, blocked_dates } = req.body;
    
    await query(`
      INSERT INTO doctor_schedules (doctor_id, available_days, start_time, end_time, duration_minutes, blocked_dates)
      VALUES ($1, $2, $3, $4, $5, $6)
      ON CONFLICT (doctor_id) DO UPDATE SET
        available_days = EXCLUDED.available_days,
        start_time = EXCLUDED.start_time,
        end_time = EXCLUDED.end_time,
        duration_minutes = EXCLUDED.duration_minutes,
        blocked_dates = EXCLUDED.blocked_dates
    `, [doctorId, JSON.stringify(available_days), start_time, end_time, duration_minutes, JSON.stringify(blocked_dates)]);
    
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Get appointments for doctor
router.get('/doctor', authenticateToken, isDoctor, async (req: any, res) => {
  try {
    const doctorId = req.user.id;
    const result = await query('SELECT * FROM appointments WHERE doctor_id = $1 ORDER BY date DESC, start_time DESC', [doctorId]);
    res.json(result.rows);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Update appointment status by doctor
const updateStatusSchema = z.object({
  body: z.object({
    status: z.enum(['Pending', 'Confirmed', 'Completed', 'Cancelled'])
  })
});

router.patch('/:id/status', authenticateToken, isDoctor, validateRequest(updateStatusSchema), async (req: any, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const doctorId = req.user.id;
    
    const apptResult = await query('SELECT * FROM appointments WHERE id = $1 AND doctor_id = $2', [id, doctorId]);
    if (apptResult.rows.length === 0) {
      return res.status(404).json({ error: 'Appointment not found' });
    }
    const appt = apptResult.rows[0];
    
    await query('UPDATE appointments SET status = $1 WHERE id = $2', [status, id]);
    
    // Send Notification to Patient
    await query(`
      INSERT INTO notifications (id, user_id, type, message)
      VALUES ($1, $2, $3, $4)
    `, [uuidv4(), appt.patient_id, 'APPOINTMENT_UPDATE', `Your appointment on ${appt.date} at ${appt.start_time} has been ${status.toLowerCase()}.`]);
    
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ===================== PATIENT API =====================

// Get appointments for patient
router.get('/patient', authenticateToken, async (req: any, res) => {
  try {
    const patientId = req.user.id;
    const result = await query(`
      SELECT a.*, d.fullName as doctorName, d.specialty 
      FROM appointments a
      JOIN doctors d ON a.doctor_id = d.id
      WHERE a.patient_id = $1 
      ORDER BY a.date DESC, a.start_time DESC
    `, [patientId]);
    res.json(result.rows);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Get doctor schedule for booking
router.get('/doctor-schedule/:doctorId', authenticateToken, async (req: any, res) => {
  try {
    const { doctorId } = req.params;
    const result = await query('SELECT * FROM doctor_schedules WHERE doctor_id = $1', [doctorId]);
    res.json(result.rows[0] || null);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Get booked slots for a specific date and doctor
router.get('/doctor/:doctorId/slots', authenticateToken, async (req: any, res) => {
  try {
    const { doctorId } = req.params;
    const { date } = req.query; // e.g. YYYY-MM-DD
    
    const result = await query('SELECT start_time FROM appointments WHERE doctor_id = $1 AND date = $2 AND status != $3', [doctorId, date, 'Cancelled']);
    res.json(result.rows.map(r => r.start_time));
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Book appointment
const bookApptSchema = z.object({
  body: z.object({
    doctor_id: z.string(),
    date: z.string(),
    start_time: z.string(),
    end_time: z.string()
  })
});

router.post('/book', authenticateToken, validateRequest(bookApptSchema), async (req: any, res) => {
  try {
    const patientId = req.user.id;
    const patientName = req.user.fullName;
    const { doctor_id, date, start_time, end_time } = req.body;
    
    // Check for double booking
    const existing = await query('SELECT id FROM appointments WHERE doctor_id = $1 AND date = $2 AND start_time = $3 AND status != $4', [doctor_id, date, start_time, 'Cancelled']);
    if (existing.rows.length > 0) {
      return res.status(400).json({ error: 'Time slot already booked' });
    }
    
    const apptId = uuidv4();
    await query(`
      INSERT INTO appointments (id, doctor_id, patient_id, patient_name, date, start_time, end_time, status)
      VALUES ($1, $2, $3, $4, $5, $6, $7, 'Pending')
    `, [apptId, doctor_id, patientId, patientName, date, start_time, end_time, 'Pending']);
    
    // Notification to Doctor
    await query(`
      INSERT INTO notifications (id, user_id, type, message)
      VALUES ($1, $2, $3, $4)
    `, [uuidv4(), doctor_id, 'NEW_APPOINTMENT', `New appointment request from ${patientName} on ${date} at ${start_time}.`]);
    
    // Notification to Patient
    await query(`
      INSERT INTO notifications (id, user_id, type, message)
      VALUES ($1, $2, $3, $4)
    `, [uuidv4(), patientId, 'APPOINTMENT_REQUESTED', `Your appointment request with doctor on ${date} at ${start_time} has been submitted.`]);
    
    res.json({ success: true, appointmentId: apptId });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Get user notifications
router.get('/notifications', authenticateToken, async (req: any, res) => {
  try {
    const result = await query('SELECT * FROM notifications WHERE user_id = $1 ORDER BY created_at DESC LIMIT 50', [req.user.id]);
    res.json(result.rows);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/notifications/read', authenticateToken, async (req: any, res) => {
  try {
    await query('UPDATE notifications SET is_read = true WHERE user_id = $1', [req.user.id]);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
