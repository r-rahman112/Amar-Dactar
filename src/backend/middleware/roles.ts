import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth';

export const requireRole = (roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (req.user.role === 'superadmin') {
      return next(); // SuperAdmin can access anything
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Forbidden: Insufficient permissions' });
    }

    next();
  };
};

export const isAdmin = requireRole(['admin', 'superadmin']);
export const isAssistantAdmin = requireRole(['admin', 'superadmin', 'assistant_admin']);
export const isSuperAdmin = requireRole(['superadmin']);
export const isDoctor = requireRole(['doctor', 'superadmin']);

