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

// CORS configuration restricted by environment variable (CLIENT_ORIGIN / CLIENT_URL, comma-separated allowed)
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (such as mobile apps, curl, or same-origin requests)
      if (!origin) return callback(null, true);
      
      const isAllowed =
        config.allowedOrigins.includes(origin) ||
        config.allowedOrigins.includes('*') ||
        config.allowedOrigins.some((allowed) => allowed.toLowerCase() === origin.toLowerCase());

      if (isAllowed) {
        return callback(null, true);
      }
      return callback(new Error(`Origin ${origin} not permitted by CORS policy`));
    },
    credentials: true,
  })
);

app.use(express.json());
app.use(morgan('dev'));

// Ensure DB connection and auto-create admin if none exists (cached across serverless invocations)
let adminInitChecked = false;
app.use(async (req, res, next) => {
  // Only connect to DB on API requests, skip health check
  if (req.path.startsWith('/api') && req.path !== '/api/health') {
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
  }
  next();
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
app.use('/api/auth/login', loginLimiter);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'Community Fridge Log API',
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

// Mount modular REST routes
app.use('/api/auth', authRoutes);
app.use('/api/items', itemRoutes);
app.use('/api/logs', logRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/users', userRoutes);
app.use('/api/fridges', fridgeRoutes);

// Catch-all 404 and centralized error handler
app.use(notFound);
app.use(errorHandler);

export default app;
