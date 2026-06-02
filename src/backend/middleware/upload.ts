import multer from 'multer';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import { NextFunction, Request, Response } from 'express';

const uploadDir = process.env.FILE_UPLOAD_PATH || path.join(process.cwd(), 'uploads');

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // Force lowercase extension and restrict strictly
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${uuidv4()}${ext}`);
  }
});

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
  if (!req.file) return next();

  // 2. Validate magic bytes
  try {
    const fd = fs.openSync(req.file.path, 'r');
    const buffer = Buffer.alloc(24);
    fs.readSync(fd, buffer, 0, 24, 0);
    fs.closeSync(fd);

    const hex = buffer.toString('hex').toUpperCase();
    const isJPEG = hex.startsWith('FFD8FF');
    const isPNG = hex.startsWith('89504E470D0A1A0A');
    const isPDF = hex.startsWith('25504446'); // %PDF
    const isWEBP = buffer.toString('utf8', 0, 4) === 'RIFF' && buffer.toString('utf8', 8, 12) === 'WEBP';
    const isMP4 = hex.includes('66747970') || buffer.slice(4, 8).toString('utf8') === 'ftyp';

    let valid = false;
    if (isJPEG && req.file.mimetype === 'image/jpeg') valid = true;
    else if (isPNG && req.file.mimetype === 'image/png') valid = true;
    else if (isPDF && req.file.mimetype === 'application/pdf') valid = true;
    else if (isWEBP && req.file.mimetype === 'image/webp') valid = true;
    else if (isMP4 && req.file.mimetype === 'video/mp4') valid = true;

    if (!valid) {
      fs.unlinkSync(req.file.path);
      return res.status(400).json({ error: 'File content verification failed. Magic bytes do not match expected type.' });
    }

    next();
  } catch (error) {
    if (fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    return res.status(500).json({ error: 'Failed to process file validation' });
  }
};
