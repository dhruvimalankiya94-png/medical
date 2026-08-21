const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const PredictionHistory = require('../models/PredictionHistory');

router.use(protect);

// @desc    Get user's prediction history & risk assessments
// @route   GET /api/risk-assessment/history
// @access  Private
router.get('/history', async (req, res) => {
  try {
    const filter = req.user.role === 'admin' ? {} : { user: req.user._id };
    const history = await PredictionHistory.find(filter)
      .populate('healthRecord')
      .sort({ createdAt: -1 });
    return res.json(history);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

// @desc    Get specific prediction assessment
// @route   GET /api/risk-assessment/:id
// @access  Private
router.get('/:id', async (req, res) => {
  try {
    const assessment = await PredictionHistory.findById(req.params.id).populate('healthRecord');
    if (!assessment) {
      return res.status(404).json({ message: 'Risk assessment not found' });
    }

    if (assessment.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to access this assessment' });
    }

    return res.json(assessment);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

module.exports = router;
