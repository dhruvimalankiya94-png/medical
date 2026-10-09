import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const app = require('../backend/app.js');
const connectDB = require('../backend/config/db.js');

let dbPromise = null;

export default async function handler(req, res) {
  if (!dbPromise) {
    dbPromise = connectDB().catch((err) => {
      console.error('[!] MongoDB connection error in serverless function:', err);
      dbPromise = null;
    });
  }
  await dbPromise;
  return app(req, res);
}
