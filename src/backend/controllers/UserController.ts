import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { query } from '../config/db';
import { AuthRequest } from '../middleware/auth';
import { ENV } from '../config/env';

// Auto-create users table for preview robustness
const initDB = async () => {
  try {
    await query(`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(255) PRIMARY KEY,
        fullName VARCHAR(255),
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(50) DEFAULT 'user',
        status VARCHAR(50) DEFAULT 'active',
        violations INTEGER DEFAULT 0,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Safely add new columns if they don't exist
    try { await query("ALTER TABLE users ADD COLUMN mobile VARCHAR(50)"); } catch (e) {}
    try { await query("ALTER TABLE users ADD COLUMN profile TEXT"); } catch (e) {}
    try { await query("ALTER TABLE users ADD COLUMN token_version INT DEFAULT 0"); } catch (e) {}
    try { await query("ALTER TABLE users ADD COLUMN provider VARCHAR(50) DEFAULT 'email'"); } catch (e) {}
    try { await query("ALTER TABLE users ADD COLUMN profile_completed BOOLEAN DEFAULT true"); } catch (e) {}
    try { await query("ALTER TABLE users ADD COLUMN medical_profile_completed_at TIMESTAMP"); } catch (e) {}
    try { await query("ALTER TABLE users ADD COLUMN last_login_at TIMESTAMP"); } catch (e) {}
    try { await query("ALTER TABLE users ADD COLUMN updated_at TIMESTAMP"); } catch (e) {}
    try { await query("ALTER TABLE users ADD COLUMN suspended_until TIMESTAMP"); } catch (e) {}

    // Add indexes for optimization (will fail silently if already exists or db doesn't support IF NOT EXISTS on index easily)
    try { await query("CREATE INDEX idx_users_email ON users(email)"); } catch (e) {}
    try { await query("CREATE INDEX idx_users_provider ON users(provider)"); } catch (e) {}

    await query(`
      CREATE TABLE IF NOT EXISTS token_blacklist (
        token VARCHAR(500) PRIMARY KEY,
        expiresAt TIMESTAMP NOT NULL
      )
    `);

    await query(`
      CREATE TABLE IF NOT EXISTS doctors (
        id VARCHAR(255) PRIMARY KEY,
        fullName VARCHAR(255),
        degree VARCHAR(255),
        specialty VARCHAR(255),
        experience VARCHAR(100),
        consultationFee INT,
        availableStatus VARCHAR(50) DEFAULT 'available',
        photoUrl TEXT,
        bmdcRegistration VARCHAR(100),
        hospitalAffiliation VARCHAR(255),
        ratings DECIMAL(2,1),
        reviews INT,
        availableHours VARCHAR(255)
      )
    `);

    try { await query("ALTER TABLE doctors ADD COLUMN verification_status VARCHAR(50) DEFAULT 'Pending'"); } catch (e) {}

    await query(`
      CREATE TABLE IF NOT EXISTS doctor_verifications (
        doctor_id VARCHAR(255) PRIMARY KEY,
        status VARCHAR(50) DEFAULT 'Pending',
        bmdc_cert_url TEXT,
        degree_cert_url TEXT,
        nid_front_url TEXT,
        nid_back_url TEXT,
        photo_url TEXT,
        rejection_reason TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await query(`
      CREATE TABLE IF NOT EXISTS paid_sessions (
        id VARCHAR(255) PRIMARY KEY,
        patient_id VARCHAR(255),
        doctor_id VARCHAR(255),
        package_minutes INT,
        amount INT DEFAULT 0,
        start_time INT,
        status VARCHAR(50) DEFAULT 'pending',
        payment_method VARCHAR(50),
        payment_status VARCHAR(50) DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    try { await query("ALTER TABLE paid_sessions ADD COLUMN amount INT DEFAULT 0"); } catch (e) {}

    await query(`
      CREATE TABLE IF NOT EXISTS doctor_schedules (
        doctor_id VARCHAR(255) PRIMARY KEY,
        available_days JSONB,
        start_time VARCHAR(10),
        end_time VARCHAR(10),
        duration_minutes INT DEFAULT 30,
        blocked_dates JSONB
      )
    `);

    await query(`
      CREATE TABLE IF NOT EXISTS appointments (
        id VARCHAR(255) PRIMARY KEY,
        doctor_id VARCHAR(255),
        patient_id VARCHAR(255),
        patient_name VARCHAR(255),
        date VARCHAR(20),
        start_time VARCHAR(10),
        end_time VARCHAR(10),
        status VARCHAR(50) DEFAULT 'Pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await query(`
      CREATE TABLE IF NOT EXISTS notifications (
        id VARCHAR(255) PRIMARY KEY,
        user_id VARCHAR(255),
        type VARCHAR(50),
        message TEXT,
        is_read BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await query(`
      CREATE TABLE IF NOT EXISTS chat_messages (
        id VARCHAR(255) PRIMARY KEY,
        session_id VARCHAR(255),
        sender_id VARCHAR(255),
        text TEXT,
        type VARCHAR(50) DEFAULT 'text',
        attachment_url TEXT,
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        is_read BOOLEAN DEFAULT false
      )
    `);

    // Seed mock doctors for demonstration if empty
    const doctorsCountResult = await query("SELECT COUNT(*) FROM doctors");
    if (parseInt(doctorsCountResult.rows[0].count) === 0) {
      const mockDoctors = [
        {
          id: uuidv4(), fullName: "Dr. Anisur Rahman", degree: "MBBS, MD (Cardiology)", specialty: "Cardiologist",
          experience: "15 Years", consultationFee: 1200, availableStatus: "available",
          photoUrl: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?q=80&w=200&auto=format&fit=crop",
          bmdcRegistration: "A-54321", hospitalAffiliation: "National Heart Foundation, Dhaka",
          ratings: 4.8, reviews: 156, availableHours: "5:00 PM - 9:00 PM (Sat-Thu)"
        },
        {
          id: uuidv4(), fullName: "Dr. Laila Hossain", degree: "MBBS, DDV, FCPS", specialty: "Dermatologist",
          experience: "10 Years", consultationFee: 1000, availableStatus: "available",
          photoUrl: "https://images.unsplash.com/photo-1594824432257-f67f22d02c9c?q=80&w=200&auto=format&fit=crop",
          bmdcRegistration: "A-23940", hospitalAffiliation: "Bangabandhu Sheikh Mujib Medical University",
          ratings: 4.9, reviews: 203, availableHours: "4:00 PM - 8:00 PM (Sun-Thu)"
        },
        {
          id: uuidv4(), fullName: "Dr. Tariq Hasan", degree: "MBBS, DCH, MD (Pediatrics)", specialty: "Pediatrician",
          experience: "12 Years", consultationFee: 1000, availableStatus: "available",
          photoUrl: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?q=80&w=200&auto=format&fit=crop",
          bmdcRegistration: "A-44321", hospitalAffiliation: "Dhaka Shishu Hospital",
          ratings: 4.7, reviews: 98, availableHours: "3:00 PM - 7:00 PM (Sat-Wed)"
        },
        {
          id: uuidv4(), fullName: "Dr. Sayema Akter", degree: "MBBS, MPhil, FCPS (Psychiatry)", specialty: "Psychiatrist",
          experience: "8 Years", consultationFee: 1500, availableStatus: "available",
          photoUrl: "https://images.unsplash.com/photo-1651008376811-b90baee60c1f?q=80&w=200&auto=format&fit=crop",
          bmdcRegistration: "A-12845", hospitalAffiliation: "National Institute of Mental Health",
          ratings: 4.6, reviews: 75, availableHours: "6:00 PM - 9:00 PM (Mon-Thu)"
        }
      ];

      for (const d of mockDoctors) {
        await query(
          "INSERT INTO doctors (id, fullName, degree, specialty, experience, consultationFee, availableStatus, photoUrl, bmdcRegistration, hospitalAffiliation, ratings, reviews, availableHours) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)",
          [d.id, d.fullName, d.degree, d.specialty, d.experience, d.consultationFee, d.availableStatus, d.photoUrl, d.bmdcRegistration, d.hospitalAffiliation, d.ratings, d.reviews, d.availableHours]
        );
      }
    }

    await query(`
      CREATE TABLE IF NOT EXISTS otps (
        id VARCHAR(255) PRIMARY KEY,
        identifier VARCHAR(255) NOT NULL,
        type VARCHAR(50) NOT NULL,
        hashed_otp TEXT NOT NULL,
        attempts INTEGER DEFAULT 0,
        expires_at TIMESTAMP NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await query(`
      CREATE TABLE IF NOT EXISTS audit_logs (
        id VARCHAR(255) PRIMARY KEY,
        adminId VARCHAR(255),
        adminName VARCHAR(255),
        action VARCHAR(255),
        targetUserId VARCHAR(255),
        targetUserName VARCHAR(255),
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await query(`
      CREATE TABLE IF NOT EXISTS health_vault_records (
        id VARCHAR(255) PRIMARY KEY,
        user_id VARCHAR(255) NOT NULL,
        title VARCHAR(255) NOT NULL,
        category VARCHAR(100),
        file_url TEXT NOT NULL,
        mimetype VARCHAR(100),
        size INTEGER,
        is_encrypted BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await query(`
      CREATE TABLE IF NOT EXISTS consents (
        id VARCHAR(255) PRIMARY KEY,
        user_id VARCHAR(255) NOT NULL,
        ip_address VARCHAR(255),
        consent_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Demo admin account
    const adminCheck = await query("SELECT id FROM users WHERE email = $1", ["coding.shawon112@gmail.com"]);
    if (adminCheck.rowCount === 0) {
       const hash = await bcrypt.hash("Admin112", 10);
       await query(
         "INSERT INTO users (id, fullName, email, password, role, profile_completed) VALUES ($1, $2, $3, $4, $5, true)",
         [uuidv4(), "Admin User", "coding.shawon112@gmail.com", hash, "admin"]
       );
       console.log("Demo Admin Account Seeded: coding.shawon112@gmail.com / Admin112");
    }

  } catch (err) {
    console.error("DB Init Error:", err);
  }
};
initDB();

export class UserController {
  static async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;
      const result = await query('SELECT * FROM users WHERE email = $1', [email]);
      const user = result.rows[0];

      if (!user) {
        console.warn(`[AUDIT LOG] Failed login attempt: Email not found - ${email}`);
        return res.status(401).json({ error: 'ইমেইল অথবা পাসওয়ার্ড সঠিক নয়' });
      }

      if (!password) {
        console.warn(`[AUDIT LOG] Failed login attempt: No password provided - ${email}`);
        return res.status(401).json({ error: 'ইমেইল অথবা পাসওয়ার্ড সঠিক নয়' });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        console.warn(`[AUDIT LOG] Failed login attempt: Incorrect password - ${email}`);
        return res.status(401).json({ error: 'ইমেইল অথবা পাসওয়ার্ড সঠিক নয়' });
      }

      if (user.status === 'banned') return res.status(403).json({ error: 'Account banned' });
      if (user.status === 'suspended') return res.status(403).json({ error: 'Account suspended' });

      const accessToken = jwt.sign(
        { id: user.id, email: user.email, role: user.role, status: user.status, token_version: user.token_version }, 
        ENV.JWT_SECRET, 
        { expiresIn: '15m' }
      );

      const refreshToken = jwt.sign(
        { id: user.id }, 
        ENV.JWT_SECRET, 
        { expiresIn: '7d' }
      );

      // Set cookies
      res.cookie('accessToken', accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 15 * 60 * 1000 // 15 minutes
      });

      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
      });

      await query('UPDATE users SET last_login_at = CURRENT_TIMESTAMP WHERE id = $1', [user.id]);

      res.json({ user: { id: user.id, email: user.email, role: user.role, fullName: user.fullname || user.full_name, profileCompleted: user.profile_completed } });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  }

  static async getMe(req: AuthRequest, res: Response) {
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
    try {
      const result = await query('SELECT id, fullName, email, role, profile_completed FROM users WHERE id = $1', [req.user.id]);
      if (result.rows.length === 0) return res.status(404).json({ error: 'User not found' });
      const dbUser = result.rows[0];
      res.json({ user: { id: dbUser.id, fullName: dbUser.fullname || dbUser.fullName, email: dbUser.email, role: dbUser.role, profileCompleted: dbUser.profile_completed } });
    } catch(e) {
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  static async logout(req: AuthRequest, res: Response) {
    const accessToken = req.cookies?.accessToken;
    if (accessToken) {
      try {
        const decoded = jwt.decode(accessToken) as any;
        if (decoded && decoded.exp) {
          const expiresAt = new Date(decoded.exp * 1000);
          await query('INSERT INTO token_blacklist (token, expiresAt) VALUES ($1, $2)', [accessToken, expiresAt.toISOString()]);
        }
      } catch (e) {}
    }
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');
    res.json({ success: true });
  }

  static async refresh(req: Request, res: Response) {
    const refreshToken = req.cookies?.refreshToken;
    if (!refreshToken) return res.status(401).json({ error: 'No refresh token' });

    try {
      const decoded: any = jwt.verify(refreshToken, ENV.JWT_SECRET);
      const result = await query('SELECT * FROM users WHERE id = $1', [decoded.id]);
      const user = result.rows[0];

      if (!user) return res.status(403).json({ error: 'User not found' });
      if (user.status === 'banned') return res.status(403).json({ error: 'Account banned' });
      if (user.status === 'suspended') return res.status(403).json({ error: 'Account suspended' });

      const newAccessToken = jwt.sign(
        { id: user.id, email: user.email, role: user.role, status: user.status, token_version: user.token_version },
        ENV.JWT_SECRET,
        { expiresIn: '15m' }
      );

      res.cookie('accessToken', newAccessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 15 * 60 * 1000
      });

      res.json({ success: true, user: { id: user.id, email: user.email, role: user.role, fullName: user.fullname || user.full_name, profileCompleted: user.profile_completed } });
    } catch (e) {
      res.clearCookie('accessToken');
      res.clearCookie('refreshToken');
      res.status(403).json({ error: 'Invalid refresh token' });
    }
  }

  static async getUsers(req: AuthRequest, res: Response) {
    try {
      const result = await query('SELECT id, fullName, email, mobile, role, status, violations, profile, createdAt FROM users');
      res.json(result.rows);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  }

  static async createUser(req: AuthRequest, res: Response) {
    try {
      const { fullName, email, password, mobile, profile, hasAcceptedConsent } = req.body;
      const role = 'user'; // Force role to user for public registrations
      
      const hash = await bcrypt.hash(password, 10);
      const id = uuidv4();
      const profileString = profile ? JSON.stringify(profile) : null;
      
      await query(
        'INSERT INTO users (id, fullName, email, password, role, mobile, profile) VALUES ($1, $2, $3, $4, $5, $6, $7)',
        [id, fullName, email, hash, role, mobile || null, profileString]
      );
      
      const ipAddress = req.ip || req.connection.remoteAddress || 'unknown';
      await query(
        'INSERT INTO consents (id, user_id, ip_address) VALUES ($1, $2, $3)',
        [uuidv4(), id, ipAddress]
      );

      res.json({ success: true, id });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  }

  static async createAdmin(req: AuthRequest, res: Response) {
    try {
      const { fullName, email, password, mobile, profile } = req.body;
      const role = 'admin';
      
      const hash = await bcrypt.hash(password, 10);
      const id = uuidv4();
      const profileString = profile ? JSON.stringify(profile) : null;
      
      await query(
        'INSERT INTO users (id, fullName, email, password, role, mobile, profile) VALUES ($1, $2, $3, $4, $5, $6, $7)',
        [id, fullName, email, hash, role, mobile || null, profileString]
      );
      
      console.log(`[AUDIT LOG] ${req.user?.email || 'System'} created Admin user: ${email} (ID: ${id})`);
      try { await query('INSERT INTO audit_logs (id, adminId, adminName, action, targetUserId) VALUES ($1, $2, $3, $4, $5)', [uuidv4(), req.user?.id || 'sys', req.user?.email || 'System', `Created Admin user`, id]); } catch(e){}

      res.json({ success: true, id });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  }

  static async createDoctor(req: AuthRequest, res: Response) {
    try {
      const { fullName, email, password, mobile, profile } = req.body;
      const role = 'doctor';
      
      const hash = await bcrypt.hash(password, 10);
      const id = uuidv4();
      const profileString = profile ? JSON.stringify(profile) : null;
      
      await query(
        'INSERT INTO users (id, fullName, email, password, role, mobile, profile) VALUES ($1, $2, $3, $4, $5, $6, $7)',
        [id, fullName, email, hash, role, mobile || null, profileString]
      );
      
      console.log(`[AUDIT LOG] ${req.user?.email || 'System'} created Doctor user: ${email} (ID: ${id})`);
      try { await query('INSERT INTO audit_logs (id, adminId, adminName, action, targetUserId) VALUES ($1, $2, $3, $4, $5)', [uuidv4(), req.user?.id || 'sys', req.user?.email || 'System', `Created Doctor user`, id]); } catch(e){}

      res.json({ success: true, id });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  }

  static async createAssistantAdmin(req: AuthRequest, res: Response) {
    try {
      const { fullName, email, password, mobile, profile } = req.body;
      const role = 'assistant_admin';
      
      const hash = await bcrypt.hash(password, 10);
      const id = uuidv4();
      const profileString = profile ? JSON.stringify(profile) : null;
      
      await query(
        'INSERT INTO users (id, fullName, email, password, role, mobile, profile) VALUES ($1, $2, $3, $4, $5, $6, $7)',
        [id, fullName, email, hash, role, mobile || null, profileString]
      );
      
      console.log(`[AUDIT LOG] ${req.user?.email || 'System'} created Assistant Admin user: ${email} (ID: ${id})`);
      try { await query('INSERT INTO audit_logs (id, adminId, adminName, action, targetUserId) VALUES ($1, $2, $3, $4, $5)', [uuidv4(), req.user?.id || 'sys', req.user?.email || 'System', `Created Assistant Admin user`, id]); } catch(e){}

      res.json({ success: true, id });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  }

  static async updateUserStatus(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const { status } = req.body; 
      
      const targetUser = await query('SELECT role FROM users WHERE id = $1', [id]);
      if (targetUser.rowCount === 0) return res.status(404).json({ error: 'User not found' });
      if (targetUser.rows[0].role === 'superadmin' && req.user?.role !== 'superadmin') return res.status(403).json({ error: 'Cannot modify superadmin' });

      await query('UPDATE users SET status = $1 WHERE id = $2', [status, id]);
      
      const adminId = req.user?.id || 'sys';
      const adminName = req.user?.email || 'System';
      try { await query('INSERT INTO audit_logs (id, adminId, adminName, action, targetUserId) VALUES ($1, $2, $3, $4, $5)', [uuidv4(), adminId, adminName, `Changed status to ${status}`, id]); } catch(e){}

      res.json({ success: true });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  }

  static async updateUserRole(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const { role } = req.body; 

      const targetUser = await query('SELECT role FROM users WHERE id = $1', [id]);
      if (targetUser.rowCount === 0) return res.status(404).json({ error: 'User not found' });
      if (targetUser.rows[0].role === 'superadmin' && req.user?.role !== 'superadmin') return res.status(403).json({ error: 'Cannot modify superadmin' });

      await query('UPDATE users SET role = $1 WHERE id = $2', [role, id]);

      const adminId = req.user?.id || 'sys';
      const adminName = req.user?.email || 'System';
      try { await query('INSERT INTO audit_logs (id, adminId, adminName, action, targetUserId) VALUES ($1, $2, $3, $4, $5)', [uuidv4(), adminId, adminName, `Changed role to ${role}`, id]); } catch(e){}

      res.json({ success: true });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  }

  static async deleteUser(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;

      const targetUser = await query('SELECT role FROM users WHERE id = $1', [id]);
      if (targetUser.rowCount === 0) return res.status(404).json({ error: 'User not found' });
      if (targetUser.rows[0].role === 'superadmin' && req.user?.role !== 'superadmin') return res.status(403).json({ error: 'Cannot modify superadmin' });

      await query('DELETE FROM users WHERE id = $1', [id]);

      const adminId = req.user?.id || 'sys';
      const adminName = req.user?.email || 'System';
      try { await query('INSERT INTO audit_logs (id, adminId, adminName, action, targetUserId) VALUES ($1, $2, $3, $4, $5)', [uuidv4(), adminId, adminName, `Deleted user`, id]); } catch(e){}

      res.json({ success: true });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  }

  static async resetPassword(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const { newPassword } = req.body;

      const targetUser = await query('SELECT role FROM users WHERE id = $1', [id]);
      if (targetUser.rowCount === 0) return res.status(404).json({ error: 'User not found' });
      if (targetUser.rows[0].role === 'superadmin' && req.user?.role !== 'superadmin') return res.status(403).json({ error: 'Cannot modify superadmin' });

      const hash = await bcrypt.hash(newPassword, 10);
      await query('UPDATE users SET password = $1, token_version = token_version + 1 WHERE id = $2', [hash, id]);

      const adminId = req.user?.id || 'sys';
      const adminName = req.user?.email || 'System';
      try { await query('INSERT INTO audit_logs (id, adminId, adminName, action, targetUserId) VALUES ($1, $2, $3, $4, $5)', [uuidv4(), adminId, adminName, `Reset password`, id]); } catch(e){}

      res.json({ success: true });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  }

  static async socialLogin(req: Request, res: Response) {
    try {
      const { uid, email, displayName, photoURL, hasAcceptedConsent, provider } = req.body;
      if (!uid || !email || !provider) {
        return res.status(400).json({ error: 'Missing required Social Auth fields' });
      }

      let result = await query('SELECT * FROM users WHERE email = $1', [email]);
      let user = result.rows[0];
      const ipAddress = req.ip || req.connection.remoteAddress || 'unknown';

      if (!user) {
        if (!hasAcceptedConsent) {
           return res.json({ action: 'REQUIRES_CONSENT' });
        }
        // Create new user for social auth
        const id = uuidv4();
        // Generate a random password since they use social login
        const randomPassword = uuidv4() + uuidv4();
        const hash = await bcrypt.hash(randomPassword, 10);
        const profile = photoURL ? JSON.stringify({ avatar: photoURL }) : null;
        
        await query(
          'INSERT INTO users (id, fullName, email, password, role, profile, provider, profile_completed, last_login_at, createdat) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)',
          [id, displayName || `${provider} User`, email, hash, 'user', profile, provider, false]
        );
        
        await query(
          'INSERT INTO consents (id, user_id, ip_address) VALUES ($1, $2, $3)',
          [uuidv4(), id, ipAddress]
        );

        result = await query('SELECT * FROM users WHERE id = $1', [id]);
        user = result.rows[0];
      } else {
        // Update user
        const updates = [];
        const params = [];
        let paramIdx = 1;

        if (!user.profile && photoURL) {
           updates.push(`profile = $${paramIdx++}`);
           params.push(JSON.stringify({ avatar: photoURL }));
        }
        if (displayName && (!user.fullname || user.fullname === 'google User')) {
           updates.push(`fullName = $${paramIdx++}`);
           params.push(displayName);
        }

        updates.push(`provider = $${paramIdx++}`);
        params.push(provider);
        
        updates.push(`last_login_at = CURRENT_TIMESTAMP`);
        
        if (updates.length > 0) {
           params.push(user.id);
           await query(`UPDATE users SET ${updates.join(', ')} WHERE id = $${paramIdx}`, params);
        }
        
        result = await query('SELECT * FROM users WHERE id = $1', [user.id]);
        user = result.rows[0];
      }

      if (user.status === 'banned') return res.status(403).json({ error: 'Account banned' });
      if (user.status === 'suspended') return res.status(403).json({ error: 'Account suspended' });

      user.profileCompleted = user.profile_completed;

      const accessToken = jwt.sign(
        { id: user.id, email: user.email, role: user.role, status: user.status, token_version: user.token_version }, 
        ENV.JWT_SECRET, 
        { expiresIn: '15m' }
      );

      const refreshToken = jwt.sign(
        { id: user.id }, 
        ENV.JWT_SECRET, 
        { expiresIn: '7d' }
      );

      // Set cookies
      res.cookie('accessToken', accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 15 * 60 * 1000 // 15 minutes
      });

      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
      });

      res.json({ success: true, user: { id: user.id, email: user.email, role: user.role, fullName: user.fullname || user.full_name, profileCompleted: user.profile_completed } });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  }

  static async completeProfile(req: AuthRequest, res: Response) {
    try {
      if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
      const { mobile, profile } = req.body;
      
      if (!profile || !profile.dob || !profile.gender) {
         return res.status(400).json({ error: 'Missing required profile data.' });
      }

      await query(
        'UPDATE users SET mobile = $1, profile = $2, profile_completed = true, medical_profile_completed_at = CURRENT_TIMESTAMP WHERE id = $3',
        [mobile || null, JSON.stringify(profile), req.user.id]
      );
      
      const result = await query('SELECT * FROM users WHERE id = $1', [req.user.id]);
      const updatedUser = result.rows[0];

      res.json({ success: true, user: { id: updatedUser.id, email: updatedUser.email, role: updatedUser.role, fullName: updatedUser.fullname || updatedUser.full_name, profileCompleted: true } });
    } catch(e: any) {
      res.status(500).json({ error: e.message });
    }
  }

  static async requestOtp(req: Request, res: Response) {
    try {
      const { identifier, type } = req.body;
      if (!identifier || !type) return res.status(400).json({ error: 'Missing required fields' });
      
      if (!['signup', 'password_reset', 'phone'].includes(type)) {
        return res.status(400).json({ error: 'Invalid OTP type' });
      }

      // Generate 6 digit OTP
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      const hashedOtp = await bcrypt.hash(otp, 10);
      const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

      // Invalid existing OTPs for same identifier and type
      await query('DELETE FROM otps WHERE identifier = $1 AND type = $2', [identifier, type]);

      await query(
        'INSERT INTO otps (id, identifier, type, hashed_otp, expires_at) VALUES ($1, $2, $3, $4, $5)',
        [uuidv4(), identifier, type, hashedOtp, expiresAt]
      );

      // Audit log
      try {
        await query(
          'INSERT INTO audit_logs (id, adminId, adminName, action, targetUserId, targetUserName) VALUES ($1, $2, $3, $4, $5, $6)',
          [uuidv4(), 'sys', 'System', `Requested OTP for ${type}`, 'sys', identifier]
        );
      } catch (e) {}

      // In production, send via email or SMS
      console.log(`[OTP] Sent OTP ${otp} to ${identifier} for ${type}`);

      res.json({ success: true, message: 'OTP sent successfully' });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  }

  static async verifyOtp(req: Request, res: Response) {
    try {
      const { identifier, type, otp } = req.body;
      if (!identifier || !type || !otp) return res.status(400).json({ error: 'Missing required fields' });

      const result = await query(
        'SELECT * FROM otps WHERE identifier = $1 AND type = $2',
        [identifier, type]
      );

      if (result.rowCount === 0) {
        return res.status(400).json({ error: 'No OTP found or expired' });
      }

      const otpRecord = result.rows[0];

      if (new Date() > new Date(otpRecord.expires_at)) {
        await query('DELETE FROM otps WHERE id = $1', [otpRecord.id]);
        return res.status(400).json({ error: 'OTP expired' });
      }

      if (otpRecord.attempts >= 5) {
        await query('DELETE FROM otps WHERE id = $1', [otpRecord.id]);
        return res.status(400).json({ error: 'Too many attempts. Request a new OTP.' });
      }

      const isValid = await bcrypt.compare(otp, otpRecord.hashed_otp);
      if (!isValid) {
        await query('UPDATE otps SET attempts = attempts + 1 WHERE id = $1', [otpRecord.id]);
        return res.status(400).json({ error: 'Invalid OTP' });
      }

      // Valid OTP
      await query('DELETE FROM otps WHERE id = $1', [otpRecord.id]);

      // Audit log
      try {
        await query(
          'INSERT INTO audit_logs (id, adminId, adminName, action, targetUserId, targetUserName) VALUES ($1, $2, $3, $4, $5, $6)',
          [uuidv4(), 'sys', 'System', `Verified OTP for ${type}`, 'sys', identifier]
        );
      } catch (e) {}

      // Handle specifics: if password_reset, maybe return a token to reset it, or reset it directly if new password provided.
      res.json({ success: true, message: 'OTP verified successfully' });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  }
}

