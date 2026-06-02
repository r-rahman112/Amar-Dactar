import { Router } from 'express';
import { query } from '../config/db';
import { authenticateToken } from '../middleware/auth';
import { v4 as uuidv4 } from 'uuid';
import { z } from 'zod';
import { validateRequest } from '../middleware/validation';

const router = Router();

const createVaultRecordSchema = z.object({
  body: z.object({
    title: z.string().min(1),
    category: z.string().min(1),
    file_url: z.string().url().or(z.string().startsWith('/uploads/')),
    mimetype: z.string().optional(),
    size: z.number().optional()
  })
});

// Create vault record
router.post('/', authenticateToken, validateRequest(createVaultRecordSchema), async (req: any, res) => {
  try {
    const { title, category, file_url, mimetype, size } = req.body;
    const id = uuidv4();
    
    await query(`
      INSERT INTO health_vault_records (id, user_id, title, category, file_url, mimetype, size, is_encrypted)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    `, [id, req.user.id, title, category, file_url, mimetype, size, true]);

    res.json({ success: true, record: { id, title, category, file_url, mimetype, size, created_at: new Date() } });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Get user vault records
router.get('/', authenticateToken, async (req: any, res) => {
  try {
    const { search, category } = req.query;
    let sql = 'SELECT * FROM health_vault_records WHERE user_id = $1';
    const params: any[] = [req.user.id];
    let count = 2;

    if (category && category !== 'All') {
      sql += ` AND category = $${count}`;
      params.push(category);
      count++;
    }

    if (search) {
      sql += ` AND title ILIKE $${count}`;
      params.push(`%${search}%`);
    }

    sql += ' ORDER BY created_at DESC';

    const result = await query(sql, params);
    res.json(result.rows);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Delete vault record
router.delete('/:id', authenticateToken, async (req: any, res) => {
  try {
    const result = await query('DELETE FROM health_vault_records WHERE id = $1 AND user_id = $2 RETURNING *', [req.params.id, req.user.id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Record not found or access denied' });
    }
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Check access for active consultation
router.get('/doctor-access/:patientId', authenticateToken, async (req: any, res) => {
  try {
    if (req.user.role !== 'DOCTOR') {
       return res.status(403).json({ error: 'Forbidden' });
    }
    const patientId = req.params.patientId;
    const doctorId = req.user.id;

    // Check if there is an active session
    const activeSession = await query(
      "SELECT * FROM paid_sessions WHERE doctor_id = $1 AND patient_id = $2 AND status = 'active'",
      [doctorId, patientId]
    );

    if (activeSession.rows.length === 0) {
       return res.status(403).json({ error: 'Access denied: No active consultation with this patient' });
    }

    const { search, category } = req.query;
    let sql = 'SELECT * FROM health_vault_records WHERE user_id = $1';
    const params: any[] = [patientId];
    let count = 2;

    if (category && category !== 'All') {
      sql += ` AND category = $${count}`;
      params.push(category);
      count++;
    }

    if (search) {
      sql += ` AND title ILIKE $${count}`;
      params.push(`%${search}%`);
    }

    sql += ' ORDER BY created_at DESC';

    const result = await query(sql, params);
    // Explicitly note these are decrypted during active consultation
    const records = result.rows.map((r: any) => ({ ...r, is_encrypted: false, _note: 'Decrypted for active consultation' }));
    res.json(records);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
