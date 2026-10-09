/**
 * Threshold-based health alert engine.
 *
 * Pure, dependency-free logic so it can be unit tested without a database.
 * Thresholds follow published clinical guidance:
 *   - Blood pressure categories: American Heart Association (2017 ACC/AHA).
 *   - Fasting plasma glucose: American Diabetes Association criteria.
 *   - BMI classification: World Health Organization.
 *   - Resting heart rate / SpO2: standard adult reference ranges.
 *
 * These are screening rules for a student project, not a diagnostic tool.
 */

const THRESHOLDS = {
  bp: {
    crisisSystolic: 180,
    crisisDiastolic: 120,
    stage2Systolic: 140,
    stage2Diastolic: 90,
    stage1Systolic: 130,
    stage1Diastolic: 80,
  },
  sugarFasting: {
    diabetic: 126,
    prediabetic: 100,
    low: 70,
  },
  heartRate: { high: 100, low: 60 },
  bmi: { obese: 30, overweight: 25, underweight: 18.5 },
  oxygenSaturation: { low: 95 },
  staleRecordDays: 7,
};

const SEVERITY_RANK = { critical: 0, warning: 1, info: 2 };

const DISCLAIMER =
  'This is an automated screening alert generated from your own logged readings for educational purposes. It is not a medical diagnosis. Please consult a qualified physician.';

/**
 * Build the alert list for a single health record.
 *
 * @param {object|null} record    latest HealthRecord (plain object or document)
 * @param {object|null} options
 * @param {string} [options.latestRiskLevel] risk level from the newest ML prediction
 * @param {Date}   [options.now]   injectable clock, for deterministic tests
 * @returns {Array<object>} alerts, most severe first
 */
function buildAlerts(record, options = {}) {
  const { latestRiskLevel = null, now = new Date() } = options;
  const alerts = [];

  if (!record) {
    return [
      {
        id: 'no-records',
        severity: 'info',
        metric: 'Health Records',
        title: 'No health records yet',
        message: 'Add your first health record to start receiving personalised health alerts.',
        value: null,
        threshold: null,
        recordedOn: null,
      },
    ];
  }

  const push = (a) => alerts.push({ ...a, recordedOn: record.recordDate || null });

  const systolic = record.vitals?.bpSystolic || 0;
  const diastolic = record.vitals?.bpDiastolic || 0;
  const sugar = record.vitals?.sugarFasting || 0;
  const heartRate = record.vitals?.heartRate || 0;
  const spo2 = record.vitals?.oxygenSaturation || 0;
  const bmi = record.bmi || 0;
  const t = THRESHOLDS;

  // --- Blood pressure: report only the single highest matching category. ---
  if (systolic >= t.bp.crisisSystolic || diastolic >= t.bp.crisisDiastolic) {
    push({
      id: 'bp-crisis',
      severity: 'critical',
      metric: 'Blood Pressure',
      title: 'Hypertensive crisis range',
      message: `Your last reading was ${systolic}/${diastolic} mmHg, at or above the ${t.bp.crisisSystolic}/${t.bp.crisisDiastolic} mmHg crisis threshold. Seek medical attention promptly.`,
      value: `${systolic}/${diastolic} mmHg`,
      threshold: `${t.bp.crisisSystolic}/${t.bp.crisisDiastolic} mmHg`,
    });
  } else if (systolic >= t.bp.stage2Systolic || diastolic >= t.bp.stage2Diastolic) {
    push({
      id: 'bp-stage-2',
      severity: 'warning',
      metric: 'Blood Pressure',
      title: 'Stage 2 hypertension range',
      message: `Your last reading was ${systolic}/${diastolic} mmHg, at or above ${t.bp.stage2Systolic}/${t.bp.stage2Diastolic} mmHg. Consider consulting a physician.`,
      value: `${systolic}/${diastolic} mmHg`,
      threshold: `${t.bp.stage2Systolic}/${t.bp.stage2Diastolic} mmHg`,
    });
  } else if (systolic >= t.bp.stage1Systolic || diastolic >= t.bp.stage1Diastolic) {
    push({
      id: 'bp-stage-1',
      severity: 'info',
      metric: 'Blood Pressure',
      title: 'Slightly elevated blood pressure',
      message: `Your last reading was ${systolic}/${diastolic} mmHg, which falls in the stage 1 range. Reducing salt and staying active can help.`,
      value: `${systolic}/${diastolic} mmHg`,
      threshold: `${t.bp.stage1Systolic}/${t.bp.stage1Diastolic} mmHg`,
    });
  }

  // --- Fasting blood sugar ---
  if (sugar > 0 && sugar >= t.sugarFasting.diabetic) {
    push({
      id: 'sugar-diabetic',
      severity: 'warning',
      metric: 'Fasting Blood Sugar',
      title: 'Fasting sugar in diabetic range',
      message: `Your fasting glucose was ${sugar} mg/dL, at or above the ${t.sugarFasting.diabetic} mg/dL diabetic threshold. A confirmatory test is recommended.`,
      value: `${sugar} mg/dL`,
      threshold: `${t.sugarFasting.diabetic} mg/dL`,
    });
  } else if (sugar >= t.sugarFasting.prediabetic) {
    push({
      id: 'sugar-prediabetic',
      severity: 'info',
      metric: 'Fasting Blood Sugar',
      title: 'Fasting sugar in prediabetic range',
      message: `Your fasting glucose was ${sugar} mg/dL, above the normal ceiling of ${t.sugarFasting.prediabetic} mg/dL. Diet and exercise changes can reverse this stage.`,
      value: `${sugar} mg/dL`,
      threshold: `${t.sugarFasting.prediabetic} mg/dL`,
    });
  } else if (sugar > 0 && sugar < t.sugarFasting.low) {
    push({
      id: 'sugar-low',
      severity: 'warning',
      metric: 'Fasting Blood Sugar',
      title: 'Low fasting blood sugar',
      message: `Your fasting glucose was ${sugar} mg/dL, below the normal floor of ${t.sugarFasting.low} mg/dL. Frequent low readings should be reviewed by a physician.`,
      value: `${sugar} mg/dL`,
      threshold: `${t.sugarFasting.low} mg/dL`,
    });
  }

  // --- Oxygen saturation ---
  if (spo2 > 0 && spo2 < t.oxygenSaturation.low) {
    push({
      id: 'spo2-low',
      severity: 'warning',
      metric: 'Oxygen Saturation',
      title: 'Low oxygen saturation',
      message: `Your SpO2 was ${spo2}%, below the ${t.oxygenSaturation.low}% reference floor.`,
      value: `${spo2}%`,
      threshold: `${t.oxygenSaturation.low}%`,
    });
  }

  // --- Resting heart rate ---
  if (heartRate > t.heartRate.high) {
    push({
      id: 'hr-high',
      severity: 'info',
      metric: 'Heart Rate',
      title: 'Elevated resting heart rate',
      message: `Your resting heart rate was ${heartRate} bpm, above the normal ceiling of ${t.heartRate.high} bpm.`,
      value: `${heartRate} bpm`,
      threshold: `${t.heartRate.high} bpm`,
    });
  } else if (heartRate > 0 && heartRate < t.heartRate.low) {
    push({
      id: 'hr-low',
      severity: 'info',
      metric: 'Heart Rate',
      title: 'Low resting heart rate',
      message: `Your resting heart rate was ${heartRate} bpm, below the normal floor of ${t.heartRate.low} bpm. This is common in trained athletes.`,
      value: `${heartRate} bpm`,
      threshold: `${t.heartRate.low} bpm`,
    });
  }

  // --- BMI ---
  if (bmi >= t.bmi.obese) {
    push({
      id: 'bmi-obese',
      severity: 'warning',
      metric: 'BMI',
      title: 'BMI in obese range',
      message: `Your BMI is ${bmi}, at or above ${t.bmi.obese}. Weight reduction lowers both diabetes and cardiovascular risk.`,
      value: String(bmi),
      threshold: String(t.bmi.obese),
    });
  } else if (bmi >= t.bmi.overweight) {
    push({
      id: 'bmi-overweight',
      severity: 'info',
      metric: 'BMI',
      title: 'BMI in overweight range',
      message: `Your BMI is ${bmi}, above the healthy ceiling of ${t.bmi.overweight}.`,
      value: String(bmi),
      threshold: String(t.bmi.overweight),
    });
  } else if (bmi > 0 && bmi < t.bmi.underweight) {
    push({
      id: 'bmi-underweight',
      severity: 'info',
      metric: 'BMI',
      title: 'BMI in underweight range',
      message: `Your BMI is ${bmi}, below the healthy floor of ${t.bmi.underweight}.`,
      value: String(bmi),
      threshold: String(t.bmi.underweight),
    });
  }

  // --- Latest ML diabetes risk ---
  if (latestRiskLevel === 'High Risk') {
    push({
      id: 'ml-high-risk',
      severity: 'warning',
      metric: 'Diabetes Risk (ML)',
      title: 'Machine learning model flagged high diabetes risk',
      message: 'Your most recent risk assessment returned High Risk. Review the contributing factors on the Risk Assessment page.',
      value: 'High Risk',
      threshold: '65% probability',
    });
  }

  // --- Logging gap ---
  const recordDate = record.recordDate ? new Date(record.recordDate) : null;
  if (recordDate && !Number.isNaN(recordDate.getTime())) {
    const daysSince = Math.floor((now - recordDate) / (1000 * 60 * 60 * 24));
    if (daysSince > t.staleRecordDays) {
      push({
        id: 'stale-records',
        severity: 'info',
        metric: 'Health Records',
        title: 'No recent readings',
        message: `Your last health record is ${daysSince} days old. Log a new reading to keep your analytics accurate.`,
        value: `${daysSince} days ago`,
        threshold: `${t.staleRecordDays} days`,
      });
    }
  }

  return alerts.sort((a, b) => SEVERITY_RANK[a.severity] - SEVERITY_RANK[b.severity]);
}

module.exports = { buildAlerts, THRESHOLDS, DISCLAIMER };
