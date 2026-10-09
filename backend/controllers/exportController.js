const HealthRecord = require('../models/HealthRecord');
const DailyTask = require('../models/DailyTask');
const HealthProfile = require('../models/HealthProfile');
const PredictionHistory = require('../models/PredictionHistory');
const { toDateKey } = require('../utils/date');

/**
 * Data portability endpoints.
 *
 * The application states that users own their health data, so it has to be
 * possible to take a complete copy of it out of the system in an open format.
 */

/** RFC 4180 style escaping: quote the field and double any embedded quote. */
const csvCell = (value) => {
  if (value === null || value === undefined) return '';
  const s = String(value);
  return /[",\r\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

const toCsv = (columns, rows) => {
  const head = columns.map((c) => csvCell(c.header)).join(',');
  const body = rows.map((row) => columns.map((c) => csvCell(c.get(row))).join(','));
  // Excel opens UTF-8 CSV correctly only when a BOM is present.
  return '﻿' + [head, ...body].join('\r\n') + '\r\n';
};

const RECORD_COLUMNS = [
  { header: 'Record Date', get: (r) => (r.recordDate ? toDateKey(r.recordDate) : '') },
  { header: 'Type', get: (r) => r.type || r.recordType || '' },
  { header: 'Doctor', get: (r) => r.doctor || '' },
  { header: 'BP Systolic (mmHg)', get: (r) => r.vitals?.bpSystolic ?? '' },
  { header: 'BP Diastolic (mmHg)', get: (r) => r.vitals?.bpDiastolic ?? '' },
  { header: 'Heart Rate (bpm)', get: (r) => r.vitals?.heartRate ?? '' },
  { header: 'Fasting Sugar (mg/dL)', get: (r) => r.vitals?.sugarFasting ?? '' },
  { header: 'Oxygen Saturation (%)', get: (r) => r.vitals?.oxygenSaturation ?? '' },
  { header: 'BMI', get: (r) => r.bmi ?? '' },
  { header: 'Weight (kg)', get: (r) => r.weight ?? '' },
  { header: 'Height (cm)', get: (r) => r.height ?? '' },
  { header: 'Sleep (hours)', get: (r) => r.sleepHours ?? '' },
  { header: 'Water Intake (L)', get: (r) => r.waterIntake ?? '' },
  { header: 'Exercise (min)', get: (r) => r.exerciseMinutes ?? '' },
  { header: 'Calories (kcal)', get: (r) => r.caloriesIntake ?? '' },
  { header: 'Steps', get: (r) => r.stepsCount ?? '' },
  { header: 'Mood', get: (r) => r.mood || '' },
  { header: 'Status', get: (r) => r.status || '' },
  { header: 'Notes', get: (r) => r.notes || '' },
];

const stamp = () => toDateKey(new Date());

// @desc    Export the user's health records as CSV
// @route   GET /api/export/records.csv
// @access  Private
const exportRecordsCsv = async (req, res) => {
  try {
    const records = await HealthRecord.find({ user: req.user._id }).sort({ recordDate: 1 }).lean();
    const csv = toCsv(RECORD_COLUMNS, records);

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="healthpulse_records_${stamp()}.csv"`);
    return res.send(csv);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// @desc    Export everything the system holds about the user as JSON
// @route   GET /api/export/all.json
// @access  Private
const exportAllJson = async (req, res) => {
  try {
    const userId = req.user._id;

    const [profile, records, tasks, predictions] = await Promise.all([
      HealthProfile.findOne({ user: userId }).lean(),
      HealthRecord.find({ user: userId }).sort({ recordDate: 1 }).lean(),
      DailyTask.find({ user: userId }).sort({ taskDate: 1 }).lean(),
      PredictionHistory.find({ user: userId }).sort({ createdAt: 1 }).lean(),
    ]);

    const payload = {
      exportedAt: new Date().toISOString(),
      exportVersion: 1,
      account: {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        role: req.user.role,
        phone: req.user.phone || '',
        createdAt: req.user.createdAt,
      },
      healthProfile: profile || null,
      healthRecords: records,
      dailyTasks: tasks,
      predictionHistory: predictions,
      counts: {
        healthRecords: records.length,
        dailyTasks: tasks.length,
        predictionHistory: predictions.length,
      },
    };

    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="healthpulse_export_${stamp()}.json"`);
    return res.send(JSON.stringify(payload, null, 2));
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = { exportRecordsCsv, exportAllJson };
