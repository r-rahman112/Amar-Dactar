import { query } from '../config/db';
import { v4 as uuidv4 } from 'uuid';

export const createNotification = async (userId: string, type: string, message: string) => {
  try {
    const id = uuidv4();
    await query(`
      INSERT INTO notifications (id, user_id, type, message)
      VALUES ($1, $2, $3, $4)
    `, [id, userId, type, message]);
  } catch (error) {
    console.error('Failed to create notification:', error);
  }
};

export const createAdminNotification = async (type: string, message: string) => {
  try {
    // Find all users with ADMIN or SUPER_ADMIN
    const result = await query(`SELECT id FROM users WHERE role IN ('ADMIN', 'SUPER_ADMIN')`);
    for (const row of result.rows) {
      await createNotification(row.id, type, message);
    }
  } catch (error) {
    console.error('Failed to create admin notification:', error);
  }
};
