import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import helmet from "helmet";
import cors from "cors";
import dotenv from "dotenv";
import { createServer } from "http";
import cookieParser from "cookie-parser";

import aiRoutes from "./src/backend/routes/ai.routes";
import uploadRoutes from "./src/backend/routes/upload.routes";
import userRoutes from "./src/backend/routes/user.routes";
import doctorRoutes from "./src/backend/routes/doctor.routes";
import paymentRoutes from "./src/backend/routes/payment.routes";
import appointmentRoutes from "./src/backend/routes/appointment.routes";
import notificationRoutes from "./src/backend/routes/notification.routes";
import adminRoutes from "./src/backend/routes/admin.routes";
import vaultRoutes from "./src/backend/routes/vault.routes";
import { setupSocketIO } from "./src/backend/socket";

import { validateEnv } from "./src/backend/config/env";
import { aiConfig } from "./src/backend/config/aiConfig";

dotenv.config();

// Validate Environment Variables
validateEnv();

async function startServer() {
  const app = express();
  const PORT = 3000;
  
  const httpServer = createServer(app);
  setupSocketIO(httpServer);

  const isDev = process.env.NODE_ENV !== "production";

  // Security Middleware
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        fontSrc: ["'self'", "data:", "https://fonts.gstatic.com", "https://res.cloudinary.com"],
        imgSrc: ["'self'", "data:", "blob:", "https://images.unsplash.com"],
        connectSrc: ["'self'", "ws:", "wss:", "https://openrouter.ai", "http://localhost:11434", "http://127.0.0.1:11434"],
        objectSrc: ["'none'"],
        baseUri: ["'self'"],
        formAction: ["'self'"],
        frameAncestors: isDev ? ["'self'", "https://*.run.app", "https://*.google.com", "https://ai.studio", "http://localhost:*"] : ["'self'"],
        upgradeInsecureRequests: [],
      }
    }
  }));
  app.use(cors({
    origin: true,
    credentials: true,
  }));
  app.use(cookieParser());

  // Body parsing
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ extended: true, limit: "50mb" }));

  // Static files for uploads
  app.use('/uploads', express.static(process.env.FILE_UPLOAD_PATH || path.join(process.cwd(), 'uploads')));

  // Modular API Routes
  app.use('/api/ai', aiRoutes);
  app.use('/api/upload', uploadRoutes);
  app.use('/api/users', userRoutes);
  app.use('/api/doctors', doctorRoutes);
  app.use('/api/payment', paymentRoutes);
  app.use('/api/appointments', appointmentRoutes);
  app.use('/api/notifications', notificationRoutes);
  app.use('/api/admin', adminRoutes);
  app.use('/api/vault', vaultRoutes);

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*all', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  httpServer.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`[AI] Active model: ${aiConfig.openrouter.model}`);
  });
}

startServer();

