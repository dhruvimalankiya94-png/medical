const { app, request, createUser, recordPayload, auth } = require('./helpers');

jest.mock('../services/mlService', () => ({
  predictDiabetesRisk: jest.fn().mockResolvedValue({
    prediction: 0,
    risk_probability: 0.2,
    risk_percentage: 20,
    risk_level: 'Low Risk',
    key_contributing_factors: [],
    model_used: 'test-model',
    disclaimer: 'Educational use only.',
  }),
}));

describe('GET /api/export/records.csv', () => {
  it('requires authentication', async () => {
    const res = await request(app).get('/api/export/records.csv');
    expect(res.status).toBe(401);
  });

  it('returns a CSV attachment with a header row per record', async () => {
    const { token } = await createUser();
    await auth(request(app).post('/api/records'), token).send(recordPayload());
    await auth(request(app).post('/api/records'), token).send(recordPayload());

    const res = await auth(request(app).get('/api/export/records.csv'), token);

    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toMatch(/text\/csv/);
    expect(res.headers['content-disposition']).toMatch(/attachment; filename="healthpulse_records_/);

    const lines = res.text.trim().split('\r\n');
    expect(lines).toHaveLength(3); // header + 2 records
    expect(lines[0]).toContain('Record Date');
    expect(lines[0]).toContain('Sleep (hours)');
  });

  it('starts with a UTF-8 byte order mark so spreadsheets read it correctly', async () => {
    const { token } = await createUser();
    const res = await auth(request(app).get('/api/export/records.csv'), token);
    expect(res.text.charCodeAt(0)).toBe(0xfeff);
  });

  it('escapes commas, quotes and newlines in free text', async () => {
    const { token } = await createUser();
    await auth(request(app).post('/api/records'), token).send(
      recordPayload({ notes: 'Patient said "hello", then left\nnew line' })
    );

    const res = await auth(request(app).get('/api/export/records.csv'), token);

    expect(res.text).toContain('"Patient said ""hello"", then left\nnew line"');
  });

  it('exports only the signed-in user\'s records', async () => {
    const a = await createUser();
    const b = await createUser();
    await auth(request(app).post('/api/records'), a.token).send(recordPayload());

    const res = await auth(request(app).get('/api/export/records.csv'), b.token);
    const lines = res.text.trim().split('\r\n');
    expect(lines).toHaveLength(1); // header only
  });
});

describe('GET /api/export/all.json', () => {
  it('requires authentication', async () => {
    const res = await request(app).get('/api/export/all.json');
    expect(res.status).toBe(401);
  });

  it('returns the full account data set with counts', async () => {
    const { token, email } = await createUser();
    await auth(request(app).post('/api/records'), token).send(recordPayload());
    await auth(request(app).post('/api/daily-tasks'), token).send({ title: 'Walk', category: 'walking' });

    const res = await auth(request(app).get('/api/export/all.json'), token);

    expect(res.status).toBe(200);
    expect(res.headers['content-disposition']).toMatch(/attachment; filename="healthpulse_export_/);

    const body = JSON.parse(res.text);
    expect(body.account.email).toBe(email);
    expect(body.counts).toMatchObject({ healthRecords: 1, dailyTasks: 1, predictionHistory: 1 });
    expect(body.exportVersion).toBe(1);
  });

  it('never includes the password hash or reset token', async () => {
    const { token } = await createUser();
    const res = await auth(request(app).get('/api/export/all.json'), token);
    const body = JSON.parse(res.text);

    expect(body.account).not.toHaveProperty('password');
    expect(body.account).not.toHaveProperty('resetPasswordToken');
    expect(res.text).not.toMatch(/\$2[aby]\$/);
  });
});
