import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { query } from '../config/db';
import { ENV } from '../config/env';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
    status: 'active' | 'suspended' | 'banned';
    token_version?: number;
  };
}

export const optionalAuthenticateToken = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const token = req.cookies?.accessToken || (req.headers['authorization']?.split(' ')[1]);

  if (!token) return next();

  try {
    const isBlacklisted = await query('SELECT 1 FROM token_blacklist WHERE token = $1', [token]);
    if (isBlacklisted.rows.length > 0) return next();

    jwt.verify(token, ENV.JWT_SECRET, async (err: any, user: any) => {
      if (err) return next();
      
      const dbUser = await query('SELECT token_version FROM users WHERE id = $1', [user.id]);
      if (dbUser.rows[0]?.token_version !== user.token_version) return next();

      req.user = user;
      next();
    });
  } catch(e) {
    next();
  }
};

export const authenticateToken = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const token = req.cookies?.accessToken || (req.headers['authorization']?.split(' ')[1]);

  if (!token) return res.status(401).json({ error: 'Access denied. You must be logged in.' });

  try {
    const isBlacklisted = await query('SELECT 1 FROM token_blacklist WHERE token = $1', [token]);
    if (isBlacklisted.rows.length > 0) return res.status(403).json({ error: 'Token revoked' });

    jwt.verify(token, ENV.JWT_SECRET, async (err: any, user: any) => {
      if (err) return res.status(403).json({ error: 'Invalid or expired token' });
      
      // Check if password reset / token revoked globally
      const dbUser = await query('SELECT token_version FROM users WHERE id = $1', [user.id]);
      if (dbUser.rows[0]?.token_version !== user.token_version) {
        return res.status(403).json({ error: 'Session expired due to security update' });
      }

      // Check if banned or suspended
      if (user.status === 'banned') {
        return res.status(403).json({ error: 'Your account has been permanently banned.' });
      }
      if (user.status === 'suspended') {
        return res.status(403).json({ error: 'Your account is temporarily suspended.' });
      }

      req.user = user;
      next();
    });
  } catch(e) {
    return res.status(500).json({ error: 'Auth failed' });
  }
};

export const isDoctor = async (req: AuthRequest, res: Response, next: NextFunction) => {
  if (req.user?.role === 'DOCTOR') {
    next();
  } else {
    res.status(403).json({ error: 'Requires doctor privileges' });
  }
};

export const isAdmin = async (req: AuthRequest, res: Response, next: NextFunction) => {
  if (req.user?.role === 'ADMIN') {
    next();
  } else {
    res.status(403).json({ error: 'Requires admin privileges' });
  }
};