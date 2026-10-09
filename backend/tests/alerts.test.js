const { app, request, createUser, recordPayload, auth } = require('./helpers');
const { buildAlerts, THRESHOLDS } = require('../services/alertService');

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

/** Minimal record shape accepted by buildAlerts. */
const rec = (overrides = {}) => ({
  recordDate: new Date(),
  bmi: 22,
  vitals: { bpSystolic: 115, bpDiastolic: 75, sugarFasting: 90, heartRate: 70, oxygenSaturation: 98 },
  ...overrides,
});

const idsOf = (alerts) => alerts.map((a) => a.id);

describe('alertService.buildAlerts (unit)', () => {
  it('returns a guidance notice when the user has no records', () => {
    const alerts = buildAlerts(null);
    expect(idsOf(alerts)).toEqual(['no-records']);
    expect(alerts[0].severity).toBe('info');
  });

  it('produces no alerts when every reading is in range', () => {
    expect(buildAlerts(rec())).toHaveLength(0);
  });

  it('flags a hypertensive crisis as critical', () => {
    const alerts = buildAlerts(rec({ vitals: { bpSystolic: 185, bpDiastolic: 125 } }));
    expect(idsOf(alerts)).toContain('bp-crisis');
    expect(alerts.find((a) => a.id === 'bp-crisis').severity).toBe('critical');
  });

  it('reports only the highest matching blood pressure category', () => {
    const alerts = buildAlerts(rec({ vitals: { bpSystolic: 185, bpDiastolic: 125 } }));
    const bpAlerts = alerts.filter((a) => a.id.startsWith('bp-'));
    expect(bpAlerts).toHaveLength(1);
  });

  it.each([
    [{ bpSystolic: 145, bpDiastolic: 92 }, 'bp-stage-2', 'warning'],
    [{ bpSystolic: 134, bpDiastolic: 82 }, 'bp-stage-1', 'info'],
  ])('classifies BP %o as %s', (vitals, expectedId, expectedSeverity) => {
    const alerts = buildAlerts(rec({ vitals }));
    const found = alerts.find((a) => a.id === expectedId);
    expect(found).toBeDefined();
    expect(found.severity).toBe(expectedSeverity);
  });

  it('flags fasting glucose at or above the diabetic threshold', () => {
    const alerts = buildAlerts(rec({ vitals: { sugarFasting: THRESHOLDS.sugarFasting.diabetic } }));
    const found = alerts.find((a) => a.id === 'sugar-diabetic');
    expect(found).toBeDefined();
    expect(found.severity).toBe('warning');
    expect(found.value).toBe('126 mg/dL');
  });

  it('flags the prediabetic band separately', () => {
    const alerts = buildAlerts(rec({ vitals: { sugarFasting: 110 } }));
    expect(idsOf(alerts)).toContain('sugar-prediabetic');
    expect(idsOf(alerts)).not.toContain('sugar-diabetic');
  });

  it('flags hypoglycaemia', () => {
    const alerts = buildAlerts(rec({ vitals: { sugarFasting: 60 } }));
    expect(idsOf(alerts)).toContain('sugar-low');
  });

  it('ignores a zero sugar reading rather than calling it low', () => {
    const alerts = buildAlerts(rec({ vitals: { sugarFasting: 0 } }));
    expect(idsOf(alerts)).not.toContain('sugar-low');
  });

  it.each([
    [31, 'bmi-obese'],
    [27, 'bmi-overweight'],
    [17, 'bmi-underweight'],
  ])('classifies BMI %s as %s', (bmi, expectedId) => {
    expect(idsOf(buildAlerts(rec({ bmi })))).toContain(expectedId);
  });

  it('ignores a zero BMI rather than calling it underweight', () => {
    expect(idsOf(buildAlerts(rec({ bmi: 0 })))).not.toContain('bmi-underweight');
  });

  it('flags tachycardia and bradycardia', () => {
    expect(idsOf(buildAlerts(rec({ vitals: { heartRate: 110 } })))).toContain('hr-high');
    expect(idsOf(buildAlerts(rec({ vitals: { heartRate: 48 } })))).toContain('hr-low');
  });

  it('flags low oxygen saturation', () => {
    expect(idsOf(buildAlerts(rec({ vitals: { oxygenSaturation: 92 } })))).toContain('spo2-low');
  });

  it('surfaces a High Risk ML prediction', () => {
    const alerts = buildAlerts(rec(), { latestRiskLevel: 'High Risk' });
    expect(idsOf(alerts)).toContain('ml-high-risk');
  });

  it('does not surface a Low Risk ML prediction', () => {
    const alerts = buildAlerts(rec(), { latestRiskLevel: 'Low Risk' });
    expect(idsOf(alerts)).not.toContain('ml-high-risk');
  });

  it('warns when the newest record is stale', () => {
    const old = new Date();
    old.setDate(old.getDate() - 30);
    const alerts = buildAlerts(rec({ recordDate: old }));
    const found = alerts.find((a) => a.id === 'stale-records');
    expect(found).toBeDefined();
    expect(found.value).toBe('30 days ago');
  });

  it('does not warn about staleness inside the grace period', () => {
    const recent = new Date();
    recent.setDate(recent.getDate() - 2);
    expect(idsOf(buildAlerts(rec({ recordDate: recent })))).not.toContain('stale-records');
  });

  it('orders alerts critical first, then warning, then info', () => {
    const alerts = buildAlerts(
      rec({ bmi: 27, vitals: { bpSystolic: 190, bpDiastolic: 130, sugarFasting: 140 } })
    );
    const severities = alerts.map((a) => a.severity);
    expect(severities).toEqual([...severities].sort(
      (x, y) => ({ critical: 0, warning: 1, info: 2 }[x] - { critical: 0, warning: 1, info: 2 }[y])
    ));
    expect(severities[0]).toBe('critical');
  });
});

describe('GET /api/alerts', () => {
  it('requires authentication', async () => {
    const res = await request(app).get('/api/alerts');
    expect(res.status).toBe(401);
  });

  it('returns the no-records notice for a fresh account', async () => {
    const { token } = await createUser();
    const res = await auth(request(app).get('/api/alerts'), token);

    expect(res.status).toBe(200);
    expect(res.body.alerts[0].id).toBe('no-records');
    expect(res.body.disclaimer).toEqual(expect.any(String));
  });

  it('screens the most recent record and counts severities', async () => {
    const { token } = await createUser();
    await auth(request(app).post('/api/records'), token).send(
      recordPayload({
        vitals: { bpSystolic: 148, bpDiastolic: 94, sugarFasting: 141, heartRate: 70 },
        glucose: 141,
        bloodPressure: 94,
        weight: 95,
        height: 170,
      })
    );

    const res = await auth(request(app).get('/api/alerts'), token);

    const ids = res.body.alerts.map((a) => a.id);
    expect(ids).toContain('bp-stage-2');
    expect(ids).toContain('sugar-diabetic');
    expect(ids).toContain('bmi-obese');
    expect(res.body.counts.warning).toBeGreaterThanOrEqual(3);
    expect(res.body.counts.total).toBe(res.body.alerts.length);
  });

  it('does not leak another user\'s readings', async () => {
    const a = await createUser();
    const b = await createUser();
    await auth(request(app).post('/api/records'), a.token).send(
      recordPayload({ vitals: { bpSystolic: 190, bpDiastolic: 130 }, bloodPressure: 130 })
    );

    const res = await auth(request(app).get('/api/alerts'), b.token);
    expect(res.body.alerts[0].id).toBe('no-records');
  });
});

describe('GET /api/alerts/thresholds', () => {
  it('exposes the clinical constants behind the alert engine', async () => {
    const { token } = await createUser();
    const res = await auth(request(app).get('/api/alerts/thresholds'), token);

    expect(res.status).toBe(200);
    expect(res.body.sugarFasting.diabetic).toBe(126);
    expect(res.body.bmi.obese).toBe(30);
    expect(res.body.bp.stage2Systolic).toBe(140);
  });
});
