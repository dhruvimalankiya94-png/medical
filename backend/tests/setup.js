const mongoose = require('mongoose');

/**
 * Test database lifecycle.
 *
 * Every suite runs against a dedicated database that is dropped when the suite
 * finishes, so tests never touch development data. The database name is
 * suffixed with the Jest worker id so that parallel workers cannot collide.
 *
 * Set MONGO_URI_TEST to point at a different server if needed.
 */

const BASE_URI = process.env.MONGO_URI_TEST || 'mongodb://127.0.0.1:27017';
const worker = process.env.JEST_WORKER_ID || '1';
const DB_NAME = `healthpulse_test_${worker}`;

beforeAll(async () => {
  await mongoose.connect(`${BASE_URI}/${DB_NAME}`, {
    serverSelectionTimeoutMS: 8000,
  });
});

afterEach(async () => {
  // Clear between tests so each one starts from a known empty state.
  const { collections } = mongoose.connection;
  await Promise.all(Object.values(collections).map((c) => c.deleteMany({})));
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
});
