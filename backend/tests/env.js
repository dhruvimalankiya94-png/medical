/**
 * Environment for the test run. Loaded before the test framework and before any
 * application module, so routes and middleware see these values at require time.
 * Deliberately does not read backend/.env, to keep test runs independent of a
 * developer's local configuration.
 */

process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test_jwt_secret_do_not_use_in_production';
process.env.JWT_EXPIRE = '7d';
process.env.CLIENT_URL = 'http://localhost:3000';

// Point the ML client at a port nothing is listening on. The record tests mock
// the service module directly; this is a guard so that a missed mock fails fast
// instead of silently reaching a real service a developer happens to be running.
process.env.ML_SERVICE_URL = 'http://127.0.0.1:59999';
