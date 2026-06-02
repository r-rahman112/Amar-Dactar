import { Server } from 'socket.io';
import { query } from './config/db';
import jwt from 'jsonwebtoken';
import cookie from 'cookie';
import { ENV } from './config/env';
import { createNotification } from './utils/notifications';

export function setupSocketIO(server: any) {
  const io = new Server(server, {
    cors: {
      origin: true,
      credentials: true
    }
  });

  io.use((socket, next) => {
    let token = socket.handshake.auth?.token;
    if (!token && socket.handshake.headers.cookie) {
      const parsed = cookie.parse(socket.handshake.headers.cookie);
      token = parsed.accessToken;
    }
    
    if (!token) return next(new Error('Authentication error'));
    try {
      const decoded = jwt.verify(token, ENV.JWT_SECRET) as any;
      (socket as any).user = decoded;
      next();
    } catch (err) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket) => {
    console.log('User connected:', (socket as any).user.id);

    socket.on('join_session', async ({ sessionId }) => {
      // Verify user belongs to session
      const res = await query('SELECT * FROM paid_sessions WHERE id = $1', [sessionId]);
      if (res.rowCount === 0) return socket.emit('error', 'Session not found');
      
      const session = res.rows[0];
      const userId = (socket as any).user.id;
      
      if (session.patient_id !== userId && session.doctor_id !== userId) {
        return socket.emit('error', 'Unauthorized');
      }

      socket.join(`session_${sessionId}`);
      
      // Calculate remaining time
      const now = Math.floor(Date.now() / 1000);
      const startTime = session.start_time;
      const durationSecs = session.package_minutes * 60;
      const elapsed = now - startTime;
      const remainingSecs = Math.max(0, durationSecs - elapsed);
      
      socket.emit('session_joined', { sessionId, remainingSecs, status: session.status });

      // If already ended, just emit session ended
      if (session.status === 'completed' || remainingSecs === 0) {
        if (session.status !== 'completed') {
          await query('UPDATE paid_sessions SET status = $1 WHERE id = $2', ['completed', sessionId]);
          await createNotification(session.patient_id, 'CONSULTATION_ENDED', 'Your consultation has ended.');
          await createNotification(session.doctor_id, 'CONSULTATION_ENDED', 'Consultation with patient has ended.');
        }
        socket.emit('session_ended', { sessionId });
      } else {
        // Broadcast user joined
        socket.to(`session_${sessionId}`).emit('user_joined', { userId });
      }
    });

    socket.on('send_message', async ({ sessionId, text, type = 'text', attachmentUrl = null }) => {
      const userId = (socket as any).user.id;
      // Check session active
      const res = await query('SELECT * FROM paid_sessions WHERE id = $1', [sessionId]);
      if (res.rowCount === 0) return;
      const session = res.rows[0];

      if (session.status === 'completed') {
        return socket.emit('error', 'Session ended');
      }

      const now = Math.floor(Date.now() / 1000);
      if (now - session.start_time >= session.package_minutes * 60) {
        await query('UPDATE paid_sessions SET status = $1 WHERE id = $2', ['completed', sessionId]);
        await createNotification(session.patient_id, 'CONSULTATION_ENDED', 'Your consultation has ended.');
        await createNotification(session.doctor_id, 'CONSULTATION_ENDED', 'Consultation with patient has ended.');
        io.to(`session_${sessionId}`).emit('session_ended', { sessionId });
        return;
      }

      // Save message
      const msgId = 'msg-' + Date.now();
      await query(
        'INSERT INTO chat_messages (id, session_id, sender_id, text, type, attachment_url, timestamp) VALUES ($1, $2, $3, $4, $5, $6, NOW())',
        [msgId, sessionId, userId, text, type, attachmentUrl]
      );

      // Check if it's the doctor sending message to patient
      if (userId === session.doctor_id) {
         await createNotification(session.patient_id, 'NEW_MESSAGE', 'You have a new message from the doctor.');
      } else if (userId === session.patient_id) {
         await createNotification(session.doctor_id, 'NEW_MESSAGE', 'You have a new message from the patient.');
      }

      const msg = {
        id: msgId,
        sessionId,
        senderId: userId,
        text,
        type,
        attachmentUrl,
        timestamp: new Date().toISOString()
      };

      io.to(`session_${sessionId}`).emit('receive_message', msg);
    });

    socket.on('typing', ({ sessionId, isTyping }) => {
      const userId = (socket as any).user.id;
      socket.to(`session_${sessionId}`).emit('typing', { userId, isTyping });
    });

    socket.on('disconnect', () => {
       console.log('User disconnected:', (socket as any).user.id);
    });
  });
}
