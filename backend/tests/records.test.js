const { app, request, createUser, recordPayload, auth } = require('./helpers');
const HealthRecord = require('../models/HealthRecord');
const PredictionHistory = require('../models/PredictionHistory');

jest.mock('../services/mlService', () => ({
  predictDiabetesRisk: jest.fn(),
}));

const { predictDiabetesRisk } = require('../services/mlService');

const mlResult = (overrides = {}) => ({
  prediction: 0,
  risk_probability: 0.232,
  risk_percentage: 23.2,
  risk_level: 'Low Risk',
  key_contributing_factors: [],
  model_used: 'RandomForestClassifier (Pima Indians Dataset)',
  disclaimer: 'Educational use only.',
  ...overrides,
});

beforeEach(() => {
  predictDiabetesRisk.mockReset();
  predictDiabetesRisk.mockResolvedValue(mlResult());
});

describe('POST /api/records', () => {
  it('creates a record and returns an ML assessment', async () => {
    const { token } = await createUser();
    const res = await auth(request(app).post('/api/records'), token).send(recordPayload());

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.assessment.riskLevel).toBe('Low Risk');
    expect(predictDiabetesRisk).toHaveBeenCalledTimes(1);
  });

  it('persists the lifestyle and body metrics that drive the analytics charts', async () => {
    const { token } = await createUser();
    const res = await auth(request(app).post('/api/records'), token).send(recordPayload());

    const stored = await HealthRecord.findById(res.body.record._id);
    expect(stored.sleepHours).toBe(7.5);
    expect(stored.waterIntake).toBe(2.6);
    expect(stored.exerciseMinutes).toBe(40);
    expect(stored.caloriesIntake).toBe(1900);
    expect(stored.stepsCount).toBe(7000);
    expect(stored.weight).toBe(65);
    expect(stored.height).toBe(170);
    expect(stored.mood).toBe('good');
    expect(stored.vitals.heartRate).toBe(70);
    expect(stored.vitals.bpSystolic).toBe(118);
  });

  it('recomputes BMI from height and weight on save', async () => {
    const { token } = await createUser();
    // 65 kg at 1.70 m -> 22.5
    const res = await auth(request(app).post('/api/records'), token)
      .send(recordPayload({ weight: 65, height: 170, bmi: 99 }));

    const stored = await HealthRecord.findById(res.body.record._id);
    expect(stored.bmi).toBe(22.5);
  });

  it('omits mood rather than writing an invalid enum value', async () => {
    const { token } = await createUser();
    const res = await auth(request(app).post('/api/records'), token)
      .send(recordPayload({ mood: '' }));

    expect(res.status).toBe(201);
    const stored = await HealthRecord.findById(res.body.record._id);
    expect(stored.mood).toBeUndefined();
  });

  it('writes a prediction history entry linked to the record', async () => {
    const { token } = await createUser();
    const res = await auth(request(app).post('/api/records'), token).send(recordPayload());

    const history = await PredictionHistory.findOne({ healthRecord: res.body.record._id });
    expect(history).not.toBeNull();
    expect(history.riskLevel).toBe('Low Risk');
    expect(history.inputs.glucose).toBe(92);
  });

  it.each([
    ['glucose', { glucose: undefined }],
    ['bloodPressure', { bloodPressure: undefined }],
    ['bmi', { bmi: undefined }],
    ['age', { age: undefined }],
  ])('rejects a record missing %s with 400', async (_field, override) => {
    const { token } = await createUser();
    const body = recordPayload(override);
    delete body[_field];

    const res = await auth(request(app).post('/api/records'), token).send(body);
    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/required/i);
  });

  it('maps a High Risk prediction onto the record status', async () => {
    predictDiabetesRisk.mockResolvedValue(mlResult({ risk_level: 'High Risk', prediction: 1, risk_percentage: 71.4 }));
    const { token } = await createUser();

    const res = await auth(request(app).post('/api/records'), token).send(recordPayload());
    expect(res.body.record.status).toBe('High Risk');
  });

  it('maps a Moderate Risk prediction to the Mild Watch status', async () => {
    predictDiabetesRisk.mockResolvedValue(mlResult({ risk_level: 'Moderate Risk' }));
    const { token } = await createUser();

    const res = await auth(request(app).post('/api/records'), token).send(recordPayload());
    expect(res.body.record.status).toBe('Mild Watch');
  });

  it('still saves the record when the ML service is unavailable', async () => {
    predictDiabetesRisk.mockRejectedValue(new Error('ML Service request timed out after 6 seconds.'));
    const { token } = await createUser();

    const res = await auth(request(app).post('/api/records'), token).send(recordPayload());

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.assessment).toBeUndefined();
    expect(res.body.mlServiceError).toMatch(/timed out/i);

    const stored = await HealthRecord.findById(res.body.record._id);
    expect(stored).not.toBeNull();
    expect(stored.status).toBe('Recorded');
  });

  it('requires authentication', async () => {
    const res = await request(app).post('/api/records').send(recordPayload());
    expect(res.status).toBe(401);
  });
});

describe('GET /api/records', () => {
  it('paginates and reports totals', async () => {
    const { token } = await createUser();
    for (let i = 0; i < 5; i += 1) {
      await auth(request(app).post('/api/records'), token).send(recordPayload({ notes: `record ${i}` }));
    }

    const res = await auth(request(app).get('/api/records?page=1&limit=2'), token);

    expect(res.status).toBe(200);
    expect(res.body.records).toHaveLength(2);
    expect(res.body.pagination).toMatchObject({ page: 1, limit: 2, total: 5, totalPages: 3 });
  });

  it('only returns the signed-in user\'s records', async () => {
    const a = await createUser();
    const b = await createUser();
    await auth(request(app).post('/api/records'), a.token).send(recordPayload({ notes: 'belongs to A' }));

    const res = await auth(request(app).get('/api/records'), b.token);

    expect(res.status).toBe(200);
    expect(res.body.records).toHaveLength(0);
  });

  it('filters by search term', async () => {
    const { token } = await createUser();
    await auth(request(app).post('/api/records'), token).send(recordPayload({ doctor: 'Dr Iyer' }));
    await auth(request(app).post('/api/records'), token).send(recordPayload({ doctor: 'Dr Bose' }));

    const res = await auth(request(app).get('/api/records?search=iyer'), token);
    expect(res.body.records).toHaveLength(1);
    expect(res.body.records[0].doctor).toBe('Dr Iyer');
  });

  it('caps the page size at 100', async () => {
    const { token } = await createUser();
    const res = await auth(request(app).get('/api/records?limit=5000'), token);
    expect(res.body.pagination.limit).toBe(100);
  });
});

describe('PUT /api/records/:id', () => {
  it('persists edited vitals', async () => {
    const { token } = await createUser();
    const created = await auth(request(app).post('/api/records'), token).send(recordPayload());

    const res = await auth(request(app).put(`/api/records/${created.body.record._id}`), token).send({
      notes: 'updated note',
      vitals: { bpSystolic: 145, bpDiastolic: 95, sugarFasting: 130 },
    });

    expect(res.status).toBe(200);
    const stored = await HealthRecord.findById(created.body.record._id);
    expect(stored.notes).toBe('updated note');
    expect(stored.vitals.bpSystolic).toBe(145);
    expect(stored.vitals.sugarFasting).toBe(130);
    // Untouched vitals survive a partial update.
    expect(stored.vitals.heartRate).toBe(70);
  });

  it('ignores attempts to reassign the owning user or the ML status', async () => {
    const a = await createUser();
    const b = await createUser();
    const created = await auth(request(app).post('/api/records'), a.token).send(recordPayload());

    await auth(request(app).put(`/api/records/${created.body.record._id}`), a.token).send({
      user: b.user._id,
      status: 'High Risk',
      notes: 'legit change',
    });

    const stored = await HealthRecord.findById(created.body.record._id);
    expect(stored.user.toString()).toBe(a.user._id);
    expect(stored.status).toBe('Optimal');
    expect(stored.notes).toBe('legit change');
  });

  it('refuses to update another user\'s record', async () => {
    const a = await createUser();
    const b = await createUser();
    const created = await auth(request(app).post('/api/records'), a.token).send(recordPayload());

    const res = await auth(request(app).put(`/api/records/${created.body.record._id}`), b.token)
      .send({ notes: 'hijack' });

    expect(res.status).toBe(403);
  });
});

describe('DELETE /api/records/:id', () => {
  it('deletes the record and cascades to prediction history', async () => {
    const { token } = await createUser();
    const created = await auth(request(app).post('/api/records'), token).send(recordPayload());
    const id = created.body.record._id;

    const res = await auth(request(app).delete(`/api/records/${id}`), token);

    expect(res.status).toBe(200);
    expect(await HealthRecord.findById(id)).toBeNull();
    expect(await PredictionHistory.findOne({ healthRecord: id })).toBeNull();
  });

  it('refuses to delete another user\'s record', async () => {
    const a = await createUser();
    const b = await createUser();
    const created = await auth(request(app).post('/api/records'), a.token).send(recordPayload());

    const res = await auth(request(app).delete(`/api/records/${created.body.record._id}`), b.token);

    expect(res.status).toBe(403);
    expect(await HealthRecord.findById(created.body.record._id)).not.toBeNull();
  });

  it('returns 404 for an unknown id', async () => {
    const { token } = await createUser();
    const res = await auth(request(app).delete('/api/records/60f000000000000000000000'), token);
    expect(res.status).toBe(404);
  });
});

describe('GET /api/risk-assessment/history', () => {
  it('lists the assessments for the signed-in user only', async () => {
    const a = await createUser();
    const b = await createUser();
    await auth(request(app).post('/api/records'), a.token).send(recordPayload());
    await auth(request(app).post('/api/records'), a.token).send(recordPayload());
    await auth(request(app).post('/api/records'), b.token).send(recordPayload());

    const res = await auth(request(app).get('/api/risk-assessment/history'), a.token);

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(2);
    expect(res.body[0]).toHaveProperty('healthRecord');
  });
});
