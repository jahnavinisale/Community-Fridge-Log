import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  PORT: z.coerce.number().default(5000),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  MONGODB_URI: z.string().default('mongodb://127.0.0.1:27017/community_fridge'),
  JWT_SECRET: z.string().default('super_secure_community_fridge_jwt_secret_key_2026_demo'),
  JWT_EXPIRES_IN: z.string().default('7d'),
  CLIENT_URL: z.string().default('http://localhost:5173'),
  CLIENT_ORIGIN: z.string().optional(),
  ADMIN_NAME: z.string().default('Elena Rostova'),
  ADMIN_EMAIL: z.string().email().default('admin@communityfridge.org'),
  ADMIN_PASSWORD: z.string().min(6).default('AdminPass123!'),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('[Config Error] Invalid environment variables:', parsed.error.format());
  throw new Error('Environment configuration validation failed');
}

// Compute allowed origins from CLIENT_ORIGIN (comma-separated) or CLIENT_URL
const rawOrigins = parsed.data.CLIENT_ORIGIN || parsed.data.CLIENT_URL || 'http://localhost:5173';
const allowedOrigins = rawOrigins
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

export const config = {
  port: parsed.data.PORT,
  nodeEnv: parsed.data.NODE_ENV,
  mongoUri: parsed.data.MONGODB_URI,
  jwtSecret: parsed.data.JWT_SECRET,
  jwtExpiresIn: parsed.data.JWT_EXPIRES_IN,
  clientUrl: parsed.data.CLIENT_URL,
  clientOrigin: parsed.data.CLIENT_ORIGIN,
  allowedOrigins,
  adminName: parsed.data.ADMIN_NAME,
  adminEmail: parsed.data.ADMIN_EMAIL,
  adminPassword: parsed.data.ADMIN_PASSWORD,
};
