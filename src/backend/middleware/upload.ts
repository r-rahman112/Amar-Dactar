import multer from 'multer';
import path from 'path';
import { NextFunction, Request, Response } from 'express';

const storage = multer.memoryStorage();

export const upload = multer({
  storage: storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
  fileFilter: (req, file, cb) => {
    // 1. Validate MIME type and extensions strictly
    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf', 'video/mp4'];
    const allowedExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.pdf', '.mp4'];
    const ext = path.extname(file.originalname).toLowerCase();

    // 3, 4, 5, 6: Reject executables, HTML, JS, SVG by enforcing exact whitelist
    if (allowedMimeTypes.includes(file.mimetype) && allowedExtensions.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPG, PNG, WEBP, PDF, and MP4 are allowed. Executables, scripts, HTML, and SVGs are rejected.'));
    }
  }
});

export const validateMagicBytes = (req: Request, res: Response, next: NextFunction) => {
  if (!req.file || !req.file.buffer) return next();

  // 2. Validate magic bytes from memory buffer
  try {
    const buffer = req.file.buffer;
    const hex = buffer.toString('hex', 0, 12).toUpperCase();
    const isJPEG = hex.startsWith('FFD8FF');
    const isPNG = hex.startsWith('89504E470D0A1A0A');
    const isPDF = hex.startsWith('25504446'); // %PDF
    const isWEBP = buffer.length > 12 && buffer.toString('utf8', 0, 4) === 'RIFF' && buffer.toString('utf8', 8, 12) === 'WEBP';
    const isMP4 = hex.includes('66747970') || buffer.length >= 8 && buffer.slice(4, 8).toString('utf8') === 'ftyp';

    let valid = false;
    if (isJPEG && req.file.mimetype === 'image/jpeg') valid = true;
    else if (isPNG && req.file.mimetype === 'image/png') valid = true;
    else if (isPDF && req.file.mimetype === 'application/pdf') valid = true;
    else if (isWEBP && req.file.mimetype === 'image/webp') valid = true;
    else if (isMP4 && req.file.mimetype === 'video/mp4') valid = true;

    if (!valid) {
      return res.status(400).json({ error: 'File content verification failed. Magic bytes do not match expected type.' });
    }

    next();
  } catch (error) {
    return res.status(500).json({ error: 'Failed to process file validation' });
  }
};
