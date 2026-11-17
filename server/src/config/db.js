import mongoose from 'mongoose';
import { config } from './env.js';

let memServer = null;

export const connectDB = async () => {
  if (mongoose.connection.readyState === 1) {
    return;
  }

  // In test environment or explicit memory mode, use MongoMemoryServer directly
  if (process.env.NODE_ENV === 'test' || process.env.USE_MEMORY_DB === 'true') {
    try {
      console.log('[Database] Test environment: starting embedded MongoDB Memory Server...');
      const { MongoMemoryServer } = await import('mongodb-memory-server');
      if (!memServer) {
        memServer = await MongoMemoryServer.create();
      }
      const memUri = memServer.getUri();
      await mongoose.connect(memUri);
      console.log(`[Database] Connected to in-memory MongoDB at: ${memUri}`);
      return;
    } catch (memErr) {
      console.error('[Database] Failed to start in-memory MongoDB in test mode:', memErr.message);
      throw memErr;
    }
  }

  try {
    // First, attempt standard MongoDB connection
    console.log(`[Database] Attempting connection to MongoDB at: ${config.mongoUri}`);
    await mongoose.connect(config.mongoUri, {
      serverSelectionTimeoutMS: 3000,
    });
    console.log('[Database] Connected to external MongoDB successfully.');
    return;
  } catch (err) {
    console.warn(`[Database] Failed to connect to ${config.mongoUri}: ${err.message}`);
    console.log('[Database] Falling back to embedded MongoDB Memory Server for self-contained operation...');
    
    try {
      const { MongoMemoryServer } = await import('mongodb-memory-server');
      if (!memServer) {
        memServer = await MongoMemoryServer.create();
      }
      const memUri = memServer.getUri();
      console.log(`[Database] In-memory MongoDB started at: ${memUri}`);
      
      await mongoose.connect(memUri);
      console.log('[Database] Connected to in-memory MongoDB successfully.');
    } catch (memErr) {
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
    console.log('[Database] Disconnected cleanly.');
  } catch (err) {
    console.error('[Database] Error closing database connection:', err.message);
  }
};
