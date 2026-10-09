const { app, request, createUser, auth } = require('./helpers');
const HealthRecord = require('../models/HealthRecord');

/**
 * The reporting layer keys off `recordDate` (the clinical date of the reading),
 * not `createdAt` (the row insert timestamp). These tests pin that behaviour:
 * when many records are inserted in one batch -- as the database seeder does --
 * they must still spread across the chart's x-axis instead of collapsing onto
 * the single day the insert happened.
 */

const daysAgo = (n) => {
  const d = new Date();
  d.setDate(d.getDate() - n);
  d.setHours(9, 0, 0, 0);
  return d;
};

/** Insert records directly so every row shares one createdAt, like the seeder. */
const seedBackdatedRecords = async (userId, count) => {
  const rows = [];
  for (let i = 0; i < count; i += 1) {
    rows.push({
      user: userId,
      recordDate: daysAgo(i),
      type: 'daily-log',
      vitals: {
        bpSystolic: 110 + i,
        bpDiastolic: 70 + (i % 10),
        sugarFasting: 90 + i,
        heartRate: 66 + (i % 15),
      },
      bmi: 22 + i * 0.05,
      weight: 70 + i * 0.1,
      height: 175,
      sleepHours: 6 + (i % 3),
      waterIntake: 2 + (i % 2),
      exerciseMinutes: 20 + i,
      caloriesIntake: 1800 + i * 5,
      stepsCount: 5000 + i * 50,
    });
  }
  await HealthRecord.insertMany(rows);
};

describe('GET /api/reports/vitals-history', () => {
  it('spreads batch-inserted records across distinct dates', async () => {
    const { token, user } = await createUser();
    await seedBackdatedRecords(user._id, 20);

    const res = await auth(request(app).get('/api/reports/vitals-history?days=30'), token);

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(20);

    const distinctDates = new Set(res.body.map((p) => p.date));
    expect(distinctDates.size).toBe(20);
  });

  it('returns points ordered oldest first', async () => {
    const { token, user } = await createUser();
    await seedBackdatedRecords(user._id, 10);

    const res = await auth(request(app).get('/api/reports/vitals-history?days=30'), token);
    const dates = res.body.map((p) => p.date);

    expect(dates).toEqual([...dates].sort());
  });

  it('honours the days window against the clinical date', async () => {
    const { token, user } = await createUser();
    await seedBackdatedRecords(user._id, 30);

    const res = await auth(request(app).get('/api/reports/vitals-history?days=7'), token);

    expect(res.body.length).toBeGreaterThan(0);
    expect(res.body.length).toBeLessThanOrEqual(8);
  });

  it('includes every series the analytics charts plot', async () => {
    const { token, user } = await createUser();
    await seedBackdatedRecords(user._id, 3);

    const res = await auth(request(app).get('/api/reports/vitals-history?days=30'), token);
    const point = res.body[0];

    for (const key of [
      'date', 'bpSystolic', 'bpDiastolic', 'sugar', 'heartRate',
      'bmi', 'sleepHours', 'waterIntake', 'exerciseMinutes', 'caloriesIntake', 'weight',
    ]) {
      expect(point).toHaveProperty(key);
    }
    expect(point.sleepHours).toBeGreaterThan(0);
    expect(point.heartRate).toBeGreaterThan(0);
  });

  it('requires authentication', async () => {
    const res = await request(app).get('/api/reports/vitals-history');
    expect(res.status).toBe(401);
  });

  it('returns an empty array for a user with no records', async () => {
    const { token } = await createUser();
    const res = await auth(request(app).get('/api/reports/vitals-history?days=30'), token);
    expect(res.body).toEqual([]);
  });
});

describe('GET /api/reports/weekly', () => {
  it('summarises the last seven clinical days', async () => {
    const { token, user } = await createUser();
    await seedBackdatedRecords(user._id, 10);

    const res = await auth(request(app).get('/api/reports/weekly'), token);

    expect(res.status).toBe(200);
    expect(res.body.dailyBreakdown).toHaveLength(7);
    expect(res.body.summary.totalRecords).toBeGreaterThan(0);
    expect(res.body.summary.avgBpSystolic).toBeGreaterThan(0);
  });

  it('spreads records across the daily breakdown instead of stacking them on one day', async () => {
    const { token, user } = await createUser();
    await seedBackdatedRecords(user._id, 7);

    const res = await auth(request(app).get('/api/reports/weekly'), token);
    const daysWithRecords = res.body.dailyBreakdown.filter((d) => d.recordsLogged > 0);

    expect(daysWithRecords.length).toBeGreaterThan(1);
  });
});

describe('GET /api/reports/monthly', () => {
  it('returns a weekly breakdown', async () => {
    const { token, user } = await createUser();
    await seedBackdatedRecords(user._id, 25);

    const res = await auth(request(app).get('/api/reports/monthly'), token);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.weeklyBreakdown)).toBe(true);
    expect(res.body.summary.totalRecords).toBeGreaterThan(0);
  });
});

describe('GET /api/user/dashboard/stats', () => {
  it('reports aggregated counters from the newest record', async () => {
    const { token, user } = await createUser();
    await seedBackdatedRecords(user._id, 5);

    const res = await auth(request(app).get('/api/user/dashboard/stats'), token);

    expect(res.status).toBe(200);
    expect(res.body.totalRecords).toBe(5);
    expect(res.body.healthScore).toBeGreaterThan(0);
    expect(res.body.healthScore).toBeLessThanOrEqual(100);
    expect(res.body.latestRecord).not.toBeNull();
  });

  it('picks the newest record by clinical date, not insert order', async () => {
    const { token, user } = await createUser();
    // Insert the oldest reading last so insert order disagrees with recordDate.
    await HealthRecord.insertMany([
      { user: user._id, recordDate: daysAgo(1), bmi: 21, vitals: { bpSystolic: 118, bpDiastolic: 76 } },
      { user: user._id, recordDate: daysAgo(9), bmi: 29, vitals: { bpSystolic: 150, bpDiastolic: 95 } },
    ]);

    const res = await auth(request(app).get('/api/user/dashboard/stats'), token);
    expect(res.body.bmi).toBe(21);
  });

  it('requires authentication', async () => {
    const res = await request(app).get('/api/user/dashboard/stats');
    expect(res.status).toBe(401);
  });
});
