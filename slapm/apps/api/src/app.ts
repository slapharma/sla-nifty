import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import passport from 'passport';
import { errorHandler } from './middleware/errorHandler';
import authRoutes from './routes/auth.routes';

export function createApp() {
  const app = express();

  app.use(helmet());
  app.use(cors({
    origin: process.env.WEB_URL ?? 'http://localhost:5173',
    credentials: true,
  }));
  app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
  app.use(express.json({ limit: '10mb' }));
  app.use(passport.initialize());

  // Auth routes
  app.use('/api/auth', authRoutes);

  // Health check
  app.get('/health', (_req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));

  // Error handler (must be last)
  app.use(errorHandler);

  return app;
}
