const { app, request, createUser, auth } = require('./helpers');
const DailyTask = require('../models/DailyTask');

const daysAgo = (n) => {
  const d = new Date();
  d.setDate(d.getDate() - n);
  d.setHours(10, 0, 0, 0);
  return d;
};

const ymd = (d) => d.toISOString().split('T')[0];

describe('Daily task CRUD', () => {
  it('creates a task with defaults applied', async () => {
    const { token } = await createUser();
    const res = await auth(request(app).post('/api/daily-tasks'), token).send({ title: 'Morning Yoga' });

    expect(res.status).toBe(201);
    expect(res.body.title).toBe('Morning Yoga');
    expect(res.body.category).toBe('other');
    expect(res.body.completed).toBe(false);
  });

  it('rejects a task with no title', async () => {
    const { token } = await createUser();
    const res = await auth(request(app).post('/api/daily-tasks'), token).send({ category: 'water' });

    expect(res.status).toBe(400);
  });

  it('rejects an invalid category', async () => {
    const { token } = await createUser();
    const res = await auth(request(app).post('/api/daily-tasks'), token)
      .send({ title: 'Bad category', category: 'teleportation' });

    expect(res.status).toBeGreaterThanOrEqual(400);
  });

  it('lists only today\'s tasks by default', async () => {
    const { token, user } = await createUser();
    await auth(request(app).post('/api/daily-tasks'), token).send({ title: 'Today task' });
    await DailyTask.create({ user: user._id, title: 'Old task', taskDate: daysAgo(5) });

    const res = await auth(request(app).get('/api/daily-tasks'), token);

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0].title).toBe('Today task');
  });

  it('lists tasks for an explicit date', async () => {
    const { token, user } = await createUser();
    const when = daysAgo(3);
    await DailyTask.create({ user: user._id, title: 'Backdated task', taskDate: when });

    const res = await auth(request(app).get(`/api/daily-tasks?date=${ymd(when)}`), token);

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0].title).toBe('Backdated task');
  });

  it('marks a task complete', async () => {
    const { token } = await createUser();
    const created = await auth(request(app).post('/api/daily-tasks'), token).send({ title: 'Drink water' });

    const res = await auth(request(app).put(`/api/daily-tasks/${created.body._id}`), token)
      .send({ completed: true });

    expect(res.status).toBe(200);
    expect(res.body.completed).toBe(true);
  });

  it('deletes a task', async () => {
    const { token } = await createUser();
    const created = await auth(request(app).post('/api/daily-tasks'), token).send({ title: 'Temp' });

    const res = await auth(request(app).delete(`/api/daily-tasks/${created.body._id}`), token);

    expect(res.status).toBe(200);
    expect(await DailyTask.findById(created.body._id)).toBeNull();
  });

  it('returns 404 for an unknown task id', async () => {
    const { token } = await createUser();
    const res = await auth(request(app).put('/api/daily-tasks/60f000000000000000000000'), token)
      .send({ completed: true });

    expect(res.status).toBe(404);
  });

  it('requires authentication', async () => {
    const res = await request(app).get('/api/daily-tasks');
    expect(res.status).toBe(401);
  });
});

describe('GET /api/daily-tasks/streak', () => {
  it('returns zeroed counters for a new account', async () => {
    const { token } = await createUser();
    const res = await auth(request(app).get('/api/daily-tasks/streak'), token);

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ currentStreak: 0, totalTasks: 0, completedTasks: 0 });
  });

  it('counts an unbroken run of fully completed days', async () => {
    const { token, user } = await createUser();
    for (let i = 0; i < 4; i += 1) {
      await DailyTask.create({ user: user._id, title: `Day ${i}`, taskDate: daysAgo(i), completed: true });
    }

    const res = await auth(request(app).get('/api/daily-tasks/streak'), token);

    expect(res.body.currentStreak).toBeGreaterThanOrEqual(4);
    expect(res.body.totalTasks).toBe(4);
    expect(res.body.completedTasks).toBe(4);
  });

  it('stops the current streak at a day with no completion', async () => {
    const { token, user } = await createUser();
    await DailyTask.create({ user: user._id, title: 'Today', taskDate: daysAgo(0), completed: true });
    await DailyTask.create({ user: user._id, title: 'Yesterday', taskDate: daysAgo(1), completed: false });
    await DailyTask.create({ user: user._id, title: 'Older', taskDate: daysAgo(2), completed: true });

    const res = await auth(request(app).get('/api/daily-tasks/streak'), token);

    expect(res.body.currentStreak).toBe(1);
  });

  it('counts only the signed-in user\'s tasks', async () => {
    const a = await createUser();
    const b = await createUser();
    await DailyTask.create({ user: a.user._id, title: 'A', taskDate: daysAgo(0), completed: true });

    const res = await auth(request(app).get('/api/daily-tasks/streak'), b.token);
    expect(res.body.totalTasks).toBe(0);
  });
});

describe('GET /api/daily-tasks/history', () => {
  it('returns one zero-filled entry per day in the window', async () => {
    const { token } = await createUser();
    const res = await auth(request(app).get('/api/daily-tasks/history?days=7'), token);

    expect(res.status).toBe(200);
    expect(res.body.length).toBeGreaterThanOrEqual(7);
    for (const day of res.body) {
      expect(day).toHaveProperty('date');
      expect(day).toHaveProperty('total');
      expect(day).toHaveProperty('completed');
      expect(day).toHaveProperty('completionRate');
    }
  });

  it('reports the completion rate for a day', async () => {
    const { token, user } = await createUser();
    await DailyTask.create({ user: user._id, title: 'Done', taskDate: daysAgo(1), completed: true });
    await DailyTask.create({ user: user._id, title: 'Missed', taskDate: daysAgo(1), completed: false });

    const res = await auth(request(app).get('/api/daily-tasks/history?days=7'), token);
    const target = res.body.find((d) => d.date === ymd(daysAgo(1)));

    expect(target).toBeDefined();
    expect(target.total).toBe(2);
    expect(target.completed).toBe(1);
    expect(target.completionRate).toBe(50);
  });

  it('requires authentication', async () => {
    const res = await request(app).get('/api/daily-tasks/history');
    expect(res.status).toBe(401);
  });
});

describe('Health profile', () => {
  it('returns null before a profile exists', async () => {
    const { token } = await createUser();
    const res = await auth(request(app).get('/api/health-profile'), token);

    expect(res.status).toBe(200);
    expect(res.body).toBeNull();
  });

  it('creates a profile via PUT when none exists', async () => {
    const { token } = await createUser();
    const res = await auth(request(app).put('/api/health-profile'), token).send({
      dateOfBirth: '1998-06-15',
      gender: 'female',
      height: 162,
      weight: 55,
      bloodGroup: 'O+',
    });

    expect([200, 201]).toContain(res.status);
    expect(res.body.bloodGroup).toBe('O+');
  });

  it('exposes the derived age and bmi virtuals', async () => {
    const { token } = await createUser();
    await auth(request(app).put('/api/health-profile'), token).send({
      dateOfBirth: '1990-01-01',
      gender: 'male',
      height: 180,
      weight: 81,
    });

    const res = await auth(request(app).get('/api/health-profile'), token);

    expect(res.body.bmi).toBeCloseTo(25, 0);
    expect(res.body.age).toBeGreaterThan(30);
  });

  it('rejects a second profile via POST', async () => {
    const { token } = await createUser();
    const payload = { dateOfBirth: '1998-06-15', gender: 'female', height: 162, weight: 55 };

    await auth(request(app).post('/api/health-profile'), token).send(payload);
    const res = await auth(request(app).post('/api/health-profile'), token).send(payload);

    expect(res.status).toBe(400);
  });
});
