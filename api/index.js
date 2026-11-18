import app from '../server/src/app.js';

// Vercel Serverless Function entry point
// Exports the Express app instance without app.listen()
export default function handler(req, res) {
  return app(req, res);
}
