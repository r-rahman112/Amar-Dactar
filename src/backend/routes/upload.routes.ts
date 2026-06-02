import { Router } from 'express';
import { upload, validateMagicBytes } from '../middleware/upload';
import { authenticateToken } from '../middleware/auth';

const router = Router();

router.post('/file', authenticateToken, upload.single('file'), validateMagicBytes as any, (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    
    // In production, this would be an S3 URL
    const fileUrl = `/uploads/${req.file.filename}`;

    res.json({ 
      success: true, 
      url: fileUrl,
      mimetype: req.file.mimetype,
      filename: req.file.originalname 
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
