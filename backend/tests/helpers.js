const request = require('supertest');
const app = require('../app');
const User = require('../models/User');

/**
 * Shared helpers for the API test suites.
 */

const DEFAULT_PASSWORD = 'Password123!';

/** Create a user directly in the database and return { user, token }. */
const createUser = async (overrides = {}) => {
  const suffix = Math.random().toString(36).slice(2, 10);
  const payload = {
    name: 'Test User',
    email: `test.${suffix}@example.com`,
    password: DEFAULT_PASSWORD,
    ...overrides,
  };

  await User.create(payload);

  const res = await request(app)
    .post('/api/auth/login')
    .send({ email: payload.email, password: payload.password });

  if (res.status !== 200) {
    throw new Error(`Test login failed (${res.status}): ${JSON.stringify(res.body)}`);
  }

  return { user: res.body, token: res.body.token, email: payload.email, password: payload.password };
};

/** A valid POST /api/records body. */
const recordPayload = (overrides = {}) => ({
  type: 'General Checkup',
  doctor: 'Dr Test',
  vitals: { bpSystolic: 118, bpDiastolic: 76, sugarFasting: 92, heartRate: 70 },
  glucose: 92,
  bloodPressure: 76,
  bmi: 22.5,
  age: 30,
  pregnancies: 0,
  skinThickness: 20,
  insulin: 80,
  diabetesPedigreeFunction: 0.35,
  weight: 65,
  height: 170,
  sleepHours: 7.5,
  waterIntake: 2.6,
  exerciseMinutes: 40,
  caloriesIntake: 1900,
  stepsCount: 7000,
  mood: 'good',
  notes: 'created by test suite',
  ...overrides,
});

const auth = (req, token) => req.set('Authorization', `Bearer ${token}`);

module.exports = { app, request, createUser, recordPayload, auth, DEFAULT_PASSWORD };
