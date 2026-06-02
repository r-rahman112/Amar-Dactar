import { Request, Response, NextFunction } from 'express';
import sanitizeHtml from 'sanitize-html';

const sanitizeValue = (value: any): any => {
  if (typeof value === 'string') {
    return sanitizeHtml(value, {
      allowedTags: [], // No HTML tags allowed by default
      allowedAttributes: {},
    });
  }
  if (Array.isArray(value)) {
    return value.map(sanitizeValue);
  }
  if (value !== null && typeof value === 'object') {
    const sanitizedObj: any = {};
    for (const key in value) {
      sanitizedObj[key] = sanitizeValue(value[key]);
    }
    return sanitizedObj;
  }
  return value;
};

export const sanitizeRequest = (req: Request, res: Response, next: NextFunction) => {
  if (req.body) {
    req.body = sanitizeValue(req.body);
  }
  if (req.query) {
    const sanitized = sanitizeValue(req.query);
    for (const key in sanitized) {
      req.query[key] = sanitized[key];
    }
  }
  if (req.params) {
    const sanitized = sanitizeValue(req.params);
    for (const key in sanitized) {
      req.params[key] = sanitized[key];
    }
  }
  next();
};
