import { query } from '../config/db';
import { v4 as uuidv4 } from 'uuid';
import { z } from 'zod';


const handleDBError = (e: any, res: any) => {
  console.error('[DB Error]', e.message);
  if (e.message?.includes('duplicate key value violates unique constraint')) {
    if (e.message?.includes('users_email_key') || e.message?.includes('users_email_unique')) {
      return res.status(400).json({ error: 'This Email has already registered / ইমেইল ইতিমধ্যে নিবন্ধিত হয়েছে।' });
    }
    if (e.message?.includes('users_mobile_key') || e.message?.includes('users_mobile_unique')) {
      return res.status(400).json({ error: 'This Mobile number has already registered / মোবাইল নম্বর ইতিমধ্যে নিবন্ধিত হয়েছে।' });
    }
    return res.status(400).json({ error: 'A record with this information already exists.' });
  }
  return res.status(500).json({ error: 'An unexpected database error occurred. Please try again later.' });
};


// ... (existing imports, but need to reconstruct standard ones since this is top of file)
import { Router } from 'express';
import { UserController } from '../controllers/UserController';
import { authenticateToken, optionalAuthenticateToken } from '../middleware/auth';
import { isAdmin, isAssistantAdmin, isSuperAdmin } from '../middleware/roles';
import { loginLimiter, signupLimiter, adminApiLimiter, forgotPasswordLimiter, otpLimiter } from '../middleware/rateLimiter';
import { validateRequest } from '../middleware/validation';
import { sanitizeRequest } from '../middleware/sanitization';
import { 
  loginSchema, signupSchema, requestOtpSchema, verifyOtpSchema, 
  adminCreateUserSchema, updateUserStatusSchema, updateUserRoleSchema, resetPasswordSchema 
} from '../validators/schemas';

const router = Router();

// ... rest of the content will be constructed below


router.use(sanitizeRequest);

router.post('/login', loginLimiter, validateRequest(loginSchema), UserController.login);
router.post('/social-login', loginLimiter, UserController.socialLogin);
router.post('/complete-profile', authenticateToken, UserController.completeProfile);
router.post('/logout', authenticateToken, UserController.logout);
router.post('/refresh', UserController.refresh);
router.get('/me', authenticateToken, UserController.getMe);
router.get('/check-mobile', UserController.checkMobile);
router.get('/check-email', UserController.checkEmail);
router.post('/', signupLimiter, optionalAuthenticateToken, validateRequest(signupSchema), UserController.createUser);

// Super Admin Only
router.post('/admin', authenticateToken, isSuperAdmin, adminApiLimiter, validateRequest(adminCreateUserSchema), UserController.createAdmin);
router.post('/doctor', authenticateToken, isSuperAdmin, adminApiLimiter, validateRequest(adminCreateUserSchema), UserController.createDoctor);
router.post('/assistant-admin', authenticateToken, isSuperAdmin, adminApiLimiter, validateRequest(adminCreateUserSchema), UserController.createAssistantAdmin);

// Admin Routes
router.get('/', authenticateToken, isAssistantAdmin, adminApiLimiter, UserController.getUsers);
router.patch('/:id/status', authenticateToken, isAdmin, adminApiLimiter, validateRequest(updateUserStatusSchema), UserController.updateUserStatus);
router.patch('/:id/role', authenticateToken, isAdmin, adminApiLimiter, validateRequest(updateUserRoleSchema), UserController.updateUserRole);
router.delete('/:id', authenticateToken, isAdmin, adminApiLimiter, UserController.deleteUser);
router.patch('/:id/reset-password', authenticateToken, isAdmin, adminApiLimiter, validateRequest(resetPasswordSchema), UserController.resetPassword);

const appealSchema = z.object({
  body: z.object({
    email: z.string().email(),
    reason: z.string().min(10)
  })
});

import { createAdminNotification } from '../utils/notifications';

router.post('/appeal-ban', forgotPasswordLimiter, validateRequest(appealSchema), async (req: any, res) => {
  try {
    const { email, reason } = req.body;
    // Just send notification to admins
    await createAdminNotification('BAN_APPEAL', `User ${email} appealed ban. Reason: ${reason}`);
    res.json({ success: true, message: 'Appeal submitted successfully.' });
  } catch (err: any) {
    handleDBError(err, res);
  }
});

// Doctor Verifications
router.get('/doctor-verifications', authenticateToken, isAssistantAdmin, adminApiLimiter, async (req: any, res) => {
  try {
    const result = await query(`
      SELECT dv.*, u.fullname, u.email 
      FROM doctor_verifications dv
      JOIN users u ON dv.doctor_id = u.id
      ORDER BY dv.created_at DESC
    `);
    res.json(result.rows);
  } catch (err: any) {
    handleDBError(err, res);
  }
});

const verificationUpdateSchema = z.object({
  body: z.object({
    status: z.enum(['Pending', 'Under Review', 'Verified', 'Rejected', 'Suspended']),
    rejection_reason: z.string().optional().nullable()
  })
});

router.patch('/doctor-verifications/:doctorId', authenticateToken, isAdmin, adminApiLimiter, validateRequest(verificationUpdateSchema), async (req: any, res) => {
  try {
    const { doctorId } = req.params;
    const { status, rejection_reason } = req.body;
    const adminId = req.user.id;
    const adminName = req.user.email;

    await query(
      "UPDATE doctor_verifications SET status = $1, rejection_reason = $2, updated_at = CURRENT_TIMESTAMP WHERE doctor_id = $3",
      [status, rejection_reason || null, doctorId]
    );

    await query("UPDATE doctors SET verification_status = $1 WHERE id = $2", [status, doctorId]);

    try { await query('INSERT INTO audit_logs (id, adminId, adminName, action, targetUserId) VALUES ($1, $2, $3, $4, $5)', [uuidv4(), adminId, adminName, `Changed doctor verification status to ${status}`, doctorId]); } catch(e){}

    res.json({ success: true });
  } catch (err: any) {
    handleDBError(err, res);
  }
});

router.post('/request-otp', forgotPasswordLimiter, validateRequest(requestOtpSchema), UserController.requestOtp);
router.post('/verify-otp', otpLimiter, validateRequest(verifyOtpSchema), UserController.verifyOtp);

import { ModerationService } from '../services/ModerationService';

router.post('/support/moderate', authenticateToken, async (req: any, res: any) => {
  const { message } = req.body;
  const userId = req.user?.id;
  
  if (message && userId) {
    const isProfane = await ModerationService.isProrofane(message);
    if (isProfane) {
      const modResult = await ModerationService.handleViolation(userId);
      if (modResult.action === 'warning') {
        return res.status(400).json({ error: modResult.message });
      } else {
        return res.status(403).json({ error: modResult.message });
      }
    }
  }

  res.json({ success: true });
});

export default router;
