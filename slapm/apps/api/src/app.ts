import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import passport from 'passport';
import { errorHandler } from './middleware/errorHandler';
import authRoutes from './routes/auth.routes';
import projectRoutes from './routes/projects.routes';
import taskRoutes from './routes/tasks.routes';
import milestoneRoutes from './routes/milestones.routes';
import commentRoutes from './routes/comments.routes';
import driveRoutes from './routes/drive.routes';
import exportRoutes from './routes/export.routes';

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

  // Projects routes
  app.use('/api/projects', projectRoutes);

  // Tasks routes
  app.use('/api/tasks', taskRoutes);

  // Milestones routes
  app.use('/api/milestones', milestoneRoutes);

  // Comments routes
  app.use('/api/comments', commentRoutes);

  // Drive routes
  app.use('/api/drive', driveRoutes);

  // Export routes
  app.use('/api/export', exportRoutes);

  // Health check
  app.get('/health', (_req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));

  // Error handler (must be last)
  app.use(errorHandler);

  return app;
}
