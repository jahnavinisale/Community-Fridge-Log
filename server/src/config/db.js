import mongoose from 'mongoose';
import { config } from './env.js';

let memServer = null;

// Cache Mongoose connection across serverless invocations
let cached = global.mongoose;
if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

export const connectDB = async () => {
  // 1. If connection already active, return immediately
  if (cached.conn && mongoose.connection.readyState === 1) {
    return cached.conn;
  }

  // 2. If test mode or explicit memory mode, use MongoMemoryServer
  if (process.env.NODE_ENV === 'test' || process.env.USE_MEMORY_DB === 'true') {
    if (!cached.promise) {
      console.log('[Database] Test environment: starting embedded MongoDB Memory Server...');
      const { MongoMemoryServer } = await import('mongodb-memory-server');
      if (!memServer) {
        memServer = await MongoMemoryServer.create();
      }
      const memUri = memServer.getUri();
      cached.promise = mongoose.connect(memUri);
    }
    cached.conn = await cached.promise;
    return cached.conn;
  }

  // 3. If a connection is in-flight, await the existing promise
  if (cached.promise && mongoose.connection.readyState === 2) {
    cached.conn = await cached.promise;
    return cached.conn;
  }

  // 4. Connect to external MongoDB (MongoDB Atlas)
  const opts = {
    bufferCommands: false,
    serverSelectionTimeoutMS: 5000,
  };

  try {
    cached.promise = mongoose.connect(config.mongoUri, opts);
    cached.conn = await cached.promise;
    console.log('[Database] Connected to external MongoDB successfully.');
    return cached.conn;
  } catch (err) {
    cached.promise = null;
    cached.conn = null;

    // In production (Vercel), throw error so the serverless response conveys status
    if (process.env.NODE_ENV === 'production') {
      console.error('[Database] Failed to connect to MongoDB in production:', err.message);
      throw err;
    }

    // In local development, fall back to embedded in-memory MongoDB
    console.warn(`[Database] Failed to connect to ${config.mongoUri}: ${err.message}`);
    console.log('[Database] Falling back to embedded MongoDB Memory Server for self-contained operation...');

    try {
      const { MongoMemoryServer } = await import('mongodb-memory-server');
      if (!memServer) {
        memServer = await MongoMemoryServer.create();
      }
      const memUri = memServer.getUri();
      cached.promise = mongoose.connect(memUri);
      cached.conn = await cached.promise;
      console.log(`[Database] In-memory MongoDB connected at: ${memUri}`);
      return cached.conn;
    } catch (memErr) {
      cached.promise = null;
      console.error('[Database] Critical: Could not start in-memory MongoDB either:', memErr.message);
      throw new Error(`Database connection failed: ${err.message} (Memory Server: ${memErr.message})`);
    }
  }
};

export const closeDB = async () => {
  try {
    await mongoose.connection.close();
    if (memServer) {
      await memServer.stop();
      memServer = null;
    }
    cached.conn = null;
    cached.promise = null;
    console.log('[Database] Disconnected cleanly.');
  } catch (err) {
    console.error('[Database] Error closing database connection:', err.message);
  }
};
