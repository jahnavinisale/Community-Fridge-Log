import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import morgan from 'morgan';
import mongoose from 'mongoose';

import { config } from './config/env.js';
import { connectDB } from './config/db.js';
import { User } from './models/User.js';
import { populateData } from './seed/seed.js';

import authRoutes from './routes/authRoutes.js';
import itemRoutes from './routes/itemRoutes.js';
import logRoutes from './routes/logRoutes.js';
import userRoutes from './routes/userRoutes.js';
import fridgeRoutes from './routes/fridgeRoutes.js';
import statsRoutes from './routes/statsRoutes.js';

import { errorHandler } from './middleware/errorHandler.js';
import { notFound } from './middleware/notFound.js';

const app = express();

// Security headers with helmet
app.use(helmet());

// CORS configuration (supports same-origin, CLIENT_ORIGIN, and permissive fallback)
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);

      const isAllowed =
        config.allowedOrigins.includes(origin) ||
        config.allowedOrigins.includes('*') ||
        config.allowedOrigins.some((allowed) => allowed.toLowerCase() === origin.toLowerCase());

      if (isAllowed) {
        return callback(null, true);
      }
      return callback(null, true);
    },
    credentials: true,
  })
);

app.use(express.json());
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Health check endpoint (does not require DB connection)
app.get(['/api/health', '/health'], (req, res) => {
  res.json({
    status: 'ok',
    service: 'Community Fridge Log API',
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

// Ensure DB connection and auto-create admin if none exists (cached across serverless invocations)
let adminInitChecked = false;
app.use(async (req, res, next) => {
  try {
    await connectDB();
    if (!adminInitChecked) {
      const adminExists = await User.findOne({ role: 'admin' });
      if (!adminExists) {
        console.log('[Auth Init] No admin user detected. Auto-creating admin and sample stock from env...');
        await populateData();
      }
      adminInitChecked = true;
    }
    next();
  } catch (dbErr) {
    console.error('[Database Middleware Error]:', dbErr.message);
    return res.status(500).json({
      success: false,
      error: {
        message: `Database connection error: ${dbErr.message}`,
        code: 'DATABASE_ERROR',
        status: 500,
      },
    });
  }
});

// Rate limiting on login to protect against brute-force attacks
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 30, // 30 attempts per window
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      message: 'Too many login attempts. Please try again after 15 minutes.',
      code: 'TOO_MANY_REQUESTS',
      status: 429,
    },
  },
});
app.use(['/api/auth/login', '/auth/login'], loginLimiter);

// Mount modular REST routes at both /api/xxx and /xxx for robust serverless matching
app.use('/api/auth', authRoutes);
app.use('/auth', authRoutes);
app.use('/api/items', itemRoutes);
app.use('/items', itemRoutes);
app.use('/api/logs', logRoutes);
app.use('/logs', logRoutes);
app.use('/api/stats', statsRoutes);
app.use('/stats', statsRoutes);
app.use('/api/users', userRoutes);
app.use('/users', userRoutes);
app.use('/api/fridges', fridgeRoutes);
app.use('/fridges', fridgeRoutes);

// Catch-all 404 and centralized error handler
app.use(notFound);
app.use(errorHandler);

export default app;
