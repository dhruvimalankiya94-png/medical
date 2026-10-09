const express = require('express');
const cors = require('cors');
const path = require('path');

/**
 * Express application.
 *
 * Deliberately separated from server.js: this module builds and exports the app
 * without opening a socket or connecting to MongoDB, so the test suite can drive
 * it in-process with Supertest while server.js remains the production entry
 * point that listens on a port.
 */

const app = express();
const { apiLimiter } = require('./middleware/rateLimit');

const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5173',
  process.env.CLIENT_URL,
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (
      allowedOrigins.includes(origin) ||
      origin.endsWith('.vercel.app') ||
      process.env.NODE_ENV !== 'production'
    ) {
      return callback(null, true);
    }
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// The limiter bypasses itself under NODE_ENV=test unless a test opts in.
app.use('/api', apiLimiter);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Smart Healthcare API is running' });
});

// Interactive API documentation.
const swaggerUi = require('swagger-ui-express');
const openapiSpec = require('./docs/openapi');
app.get('/api/docs.json', (req, res) => res.json(openapiSpec));
app.use(
  '/api/docs',
  swaggerUi.serve,
  swaggerUi.setup(openapiSpec, {
    customSiteTitle: 'HealthPulse API Documentation',
    swaggerOptions: { persistAuthorization: true, docExpansion: 'none' },
  })
);

app.use('/api/auth', require('./routes/auth'));
app.use('/api/records', require('./routes/records'));
app.use('/api/risk-assessment', require('./routes/riskAssessment'));
app.use('/api/daily-tasks', require('./routes/dailyTasks'));
app.use('/api/health-profile', require('./routes/healthProfile'));
app.use('/api/reports', require('./routes/reports'));
app.use('/api/user/dashboard', require('./routes/userDashboard'));
app.use('/api/alerts', require('./routes/alerts'));
app.use('/api/export', require('./routes/export'));

// Hospital administration layer. These routes are a planned future extension
// and have no frontend yet, so they are gated behind an authenticated admin
// session rather than left open to anonymous callers.
const { protect, authorize } = require('./middleware/auth');
const adminOnly = [protect, authorize('admin')];

app.use('/api/patients', adminOnly, require('./routes/patients'));
app.use('/api/doctors', adminOnly, require('./routes/doctors'));
app.use('/api/appointments', adminOnly, require('./routes/appointments'));
app.use('/api/departments', adminOnly, require('./routes/departments'));
app.use('/api/invoices', adminOnly, require('./routes/invoices'));
app.use('/api/medicines', adminOnly, require('./routes/medicines'));
app.use('/api/lab-tests', adminOnly, require('./routes/labTests'));
app.use('/api/hospital/dashboard', adminOnly, require('./routes/dashboard'));

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Internal Server Error', error: err.message });
});

module.exports = app;
