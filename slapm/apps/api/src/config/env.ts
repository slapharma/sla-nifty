import { z } from 'zod';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

const envSchema = z.object({
  DATABASE_URL: z.string().default('postgresql://slapm:slapm_dev@localhost:5432/slapm'),
  JWT_SECRET: z.string().default('dev_jwt_secret_change_in_production'),
  SESSION_SECRET: z.string().default('dev_session_secret'),
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),
  GOOGLE_CALLBACK_URL: z.string().default('http://localhost:3001/api/auth/google/callback'),
  REDIS_URL: z.string().default('redis://localhost:6379'),
  API_PORT: z.string().default('3001'),
  WEB_URL: z.string().default('http://localhost:5173'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
});

export const env = envSchema.parse(process.env);
