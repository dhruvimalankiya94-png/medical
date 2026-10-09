const { app, request, createUser, auth, DEFAULT_PASSWORD } = require('./helpers');
const { authLimiter } = require('../middleware/rateLimit');

/**
 * Access control over the hospital administration layer, and the brute-force
 * protection on the credential endpoints.
 */

const ADMIN_READ_ROUTES = [
  '/api/patients',
  '/api/doctors',
  '/api/appointments',
  '/api/departments',
  '/api/invoices',
  '/api/medicines',
  '/api/lab-tests',
  '/api/hospital/dashboard/stats',
];

describe('Hospital administration routes', () => {
  it.each(ADMIN_READ_ROUTES)('rejects anonymous access to %s with 401', async (route) => {
    const res = await request(app).get(route);
    expect(res.status).toBe(401);
  });

  it.each(ADMIN_READ_ROUTES)('rejects a patient account on %s with 403', async (route) => {
    const { token } = await createUser();
    const res = await auth(request(app).get(route), token);
    expect(res.status).toBe(403);
  });

  it.each(ADMIN_READ_ROUTES)('allows an admin account on %s', async (route) => {
    const { token } = await createUser({ role: 'admin' });
    const res = await auth(request(app).get(route), token);
    expect(res.status).toBe(200);
  });

  it('blocks anonymous writes that were previously open', async () => {
    const res = await request(app).post('/api/patients').send({
      firstName: 'Anon',
      lastName: 'Injected',
      email: 'anon@example.com',
      phone: '1',
      dateOfBirth: '2000-01-01',
      gender: 'male',
    });

    expect(res.status).toBe(401);
  });

  it('blocks anonymous deletes', async () => {
    const res = await request(app).delete('/api/medicines/60f000000000000000000000');
    expect(res.status).toBe(401);
  });
});

describe('Rate limiting on credential endpoints', () => {
  beforeAll(() => {
    process.env.ENABLE_RATE_LIMITS = 'true';
  });

  afterAll(() => {
    delete process.env.ENABLE_RATE_LIMITS;
  });

  beforeEach(() => {
    // Counters are per IP and persist across requests, so clear loopback first.
    for (const key of ['::ffff:127.0.0.1', '127.0.0.1', '::1']) {
      try {
        authLimiter.resetKey(key);
      } catch {
        /* key may not exist yet */
      }
    }
  });

  it('blocks further login attempts after 10 tries in the window', async () => {
    const { email } = await createUser();
    // createUser already consumed one successful login against the limiter.
    const statuses = [];
    for (let i = 0; i < 12; i += 1) {
      const res = await request(app).post('/api/auth/login').send({ email, password: 'WrongPassword1!' });
      statuses.push(res.status);
    }

    expect(statuses).toContain(401);
    expect(statuses).toContain(429);
    // Once blocked, it must stay blocked for the rest of the window.
    expect(statuses[statuses.length - 1]).toBe(429);
  });
});

describe('Ownership enforcement across modules', () => {
  it('does not return another user\'s daily tasks', async () => {
    const a = await createUser();
    const b = await createUser();

    await auth(request(app).post('/api/daily-tasks'), a.token).send({ title: 'A task', category: 'water' });

    const res = await auth(request(app).get('/api/daily-tasks'), b.token);
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(0);
  });

  it('refuses to update another user\'s daily task', async () => {
    const a = await createUser();
    const b = await createUser();

    const created = await auth(request(app).post('/api/daily-tasks'), a.token)
      .send({ title: 'A task', category: 'water' });

    const res = await auth(request(app).put(`/api/daily-tasks/${created.body._id}`), b.token)
      .send({ completed: true });

    expect(res.status).toBe(403);
  });

  it('scopes the health profile to the signed-in user', async () => {
    const a = await createUser();
    const b = await createUser();

    await auth(request(app).put('/api/health-profile'), a.token).send({
      dateOfBirth: '1995-04-12',
      gender: 'female',
      height: 165,
      weight: 58,
    });

    const res = await auth(request(app).get('/api/health-profile'), b.token);
    expect(res.status).toBe(200);
    expect(res.body).toBeNull();
  });
});

describe('Account deletion', () => {
  it('requires the password and removes all owned data', async () => {
    const { token } = await createUser();
    await auth(request(app).post('/api/daily-tasks'), token).send({ title: 'Doomed', category: 'other' });

    const noPassword = await auth(request(app).delete('/api/auth/me'), token).send({});
    expect(noPassword.status).toBe(400);

    const wrongPassword = await auth(request(app).delete('/api/auth/me'), token).send({ password: 'Nope123456!' });
    expect(wrongPassword.status).toBe(401);

    const res = await auth(request(app).delete('/api/auth/me'), token).send({ password: DEFAULT_PASSWORD });
    expect(res.status).toBe(200);
    expect(res.body.deleted.dailyTasks).toBe(1);

    const after = await auth(request(app).get('/api/auth/me'), token);
    expect(after.status).toBe(401);
  });
});
