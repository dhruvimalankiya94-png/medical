const express = require('express');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

dotenv.config();

connectDB();

const app = express();
const { authLimiter, apiLimiter } = require('./middleware/rateLimit');

app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:5173'],
  credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/api', apiLimiter);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Smart Healthcare API is running' });
});

app.use('/api/auth', require('./routes/auth'));
app.use('/api/records', require('./routes/records'));
app.use('/api/risk-assessment', require('./routes/riskAssessment'));
app.use('/api/daily-tasks', require('./routes/dailyTasks'));
app.use('/api/health-profile', require('./routes/healthProfile'));
app.use('/api/reports', require('./routes/reports'));
app.use('/api/user/dashboard', require('./routes/userDashboard'));

app.use('/api/patients', require('./routes/patients'));
app.use('/api/doctors', require('./routes/doctors'));
app.use('/api/appointments', require('./routes/appointments'));
app.use('/api/departments', require('./routes/departments'));
app.use('/api/invoices', require('./routes/invoices'));
app.use('/api/medicines', require('./routes/medicines'));
app.use('/api/lab-tests', require('./routes/labTests'));
app.use('/api/hospital/dashboard', require('./routes/dashboard'));

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Internal Server Error', error: err.message });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
