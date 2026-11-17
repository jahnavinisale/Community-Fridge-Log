import app from './app.js';
import { connectDB } from './config/db.js';
import { config } from './config/env.js';
import { User } from './models/User.js';
import { populateData } from './seed/seed.js';

const startServer = async () => {
  try {
    await connectDB();

    // Auto-seed demo accounts and inventory if database is empty
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      console.log('[Server] Database is empty. Seeding initial accounts and sample inventory...');
      await populateData();
    }

    const server = app.listen(config.port, () => {
      console.log(`[Server] Community Fridge Log API running on port ${config.port} in ${config.nodeEnv} mode`);
      console.log(`[Server] Health check available at: http://localhost:${config.port}/api/health`);
    });

    const shutdown = async () => {
      console.log('\n[Server] Shutting down gracefully...');
      server.close(() => {
        console.log('[Server] HTTP server closed.');
        process.exit(0);
      });
    };

    process.on('SIGINT', shutdown);
    process.on('SIGTERM', shutdown);
  } catch (err) {
    console.error('[Server] Fatal startup error:', err);
    process.exit(1);
  }
};

startServer();
