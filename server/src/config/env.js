import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  PORT: z.coerce.number().default(5000),
  NODE_ENV: z.string().default('production'),
  MONGODB_URI: z.string().default('mongodb://127.0.0.1:27017/community_fridge'),
  JWT_SECRET: z.string().default('super_secure_community_fridge_jwt_secret_key_2026_demo'),
  JWT_EXPIRES_IN: z.string().default('7d'),
  CLIENT_URL: z.string().default('http://localhost:5173'),
  CLIENT_ORIGIN: z.string().optional(),
  ADMIN_NAME: z.string().default('Elena Rostova'),
  ADMIN_EMAIL: z.string().default('admin@communityfridge.org'),
  ADMIN_PASSWORD: z.string().default('AdminPass123!'),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.warn(
    '[Config Warning] Environment variables validation notice:',
    parsed.error.format()
  );
}

const envData = parsed.success ? parsed.data : {};

// Compute allowed origins safely without crashing
const rawOrigins =
  process.env.CLIENT_ORIGIN ||
  process.env.CLIENT_URL ||
  envData.CLIENT_ORIGIN ||
  envData.CLIENT_URL ||
  '*';

const allowedOrigins = rawOrigins
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

export const config = {
  port: Number(process.env.PORT) || envData.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || envData.NODE_ENV || 'production',
  mongoUri:
    process.env.MONGODB_URI ||
    envData.MONGODB_URI ||
    'mongodb://127.0.0.1:27017/community_fridge',
  jwtSecret:
    process.env.JWT_SECRET ||
    envData.JWT_SECRET ||
    'super_secure_community_fridge_jwt_secret_key_2026_demo',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || envData.JWT_EXPIRES_IN || '7d',
  clientUrl: process.env.CLIENT_URL || envData.CLIENT_URL || 'http://localhost:5173',
  clientOrigin: process.env.CLIENT_ORIGIN || envData.CLIENT_ORIGIN,
  allowedOrigins: allowedOrigins.length > 0 ? allowedOrigins : ['*'],
  adminName: process.env.ADMIN_NAME || envData.ADMIN_NAME || 'Elena Rostova',
  adminEmail: (
    process.env.ADMIN_EMAIL ||
    envData.ADMIN_EMAIL ||
    'admin@communityfridge.org'
  )
    .toLowerCase()
    .trim(),
  adminPassword:
    process.env.ADMIN_PASSWORD || envData.ADMIN_PASSWORD || 'AdminPass123!',
};
