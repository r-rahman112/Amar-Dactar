import { Router } from 'express';
import { upload, validateMagicBytes } from '../middleware/upload';
import { authenticateToken } from '../middleware/auth';
import { createClient } from '@supabase/supabase-js';
import path from 'path';

const router = Router();

// Ensure supabase is initialized if ENV vars exist (it will fail cleanly later otherwise)
const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || '';
const supabase = supabaseUrl && supabaseAnonKey ? createClient(supabaseUrl, supabaseAnonKey) : null;

router.post('/file', authenticateToken, upload.single('file'), validateMagicBytes as any, async (req: any, res) => {
  try {
    if (!req.file || !req.file.buffer) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    if (!supabase) {
      return res.status(500).json({ error: 'Supabase storage is not configured' });
    }

    const userId = req.user?.id || 'anonymous';
    const timestamp = Date.now();
    const ext = path.extname(req.file.originalname).toLowerCase();
    const uniqueFilename = `${userId}-${timestamp}${ext}`;

    const { data, error } = await supabase.storage
      .from('medical-reports')
      .upload(uniqueFilename, req.file.buffer, {
        contentType: req.file.mimetype,
        upsert: false
      });

    if (error) {
      throw error;
    }

    const { data: publicUrlData } = supabase.storage
      .from('medical-reports')
      .getPublicUrl(uniqueFilename);

    res.json({ 
      success: true, 
      url: publicUrlData.publicUrl,
      storagePath: data.path,
      mimetype: req.file.mimetype,
      filename: req.file.originalname 
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
