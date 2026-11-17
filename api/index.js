import app from '../server/src/app.js';

// Vercel Serverless Function entry point
// Exports the Express app instance without app.listen()
export default function handler(req, res) {
  // Normalize req.url to preserve the /api routing structure
  if (req.url && !req.url.startsWith('/api')) {
    req.url = '/api' + (req.url.startsWith('/') ? req.url : '/' + req.url);
  }
  return app(req, res);
}
