const HealthRecord = require('../models/HealthRecord');
const PredictionHistory = require('../models/PredictionHistory');
const { buildAlerts, THRESHOLDS, DISCLAIMER } = require('../services/alertService');

// @desc    Get threshold-based health alerts for the logged in user
// @route   GET /api/alerts
// @access  Private
const getAlerts = async (req, res) => {
  try {
    const userId = req.user._id;

    const [latestRecord, latestPrediction] = await Promise.all([
      HealthRecord.findOne({ user: userId }).sort({ recordDate: -1 }),
      PredictionHistory.findOne({ user: userId }).sort({ createdAt: -1 }),
    ]);

    const alerts = buildAlerts(latestRecord, {
      latestRiskLevel: latestPrediction?.riskLevel || null,
    });

    return res.json({
      alerts,
      counts: {
        total: alerts.length,
        critical: alerts.filter((a) => a.severity === 'critical').length,
        warning: alerts.filter((a) => a.severity === 'warning').length,
        info: alerts.filter((a) => a.severity === 'info').length,
      },
      disclaimer: DISCLAIMER,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// @desc    Get the clinical thresholds used by the alert engine
// @route   GET /api/alerts/thresholds
// @access  Private
const getThresholds = async (req, res) => {
  return res.json(THRESHOLDS);
};

module.exports = { getAlerts, getThresholds };
