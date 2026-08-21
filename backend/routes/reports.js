const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  getWeeklyReport,
  getMonthlyReport,
  getVitalsHistory,
} = require('../controllers/reportController');

router.use(protect);

router.get('/weekly', getWeeklyReport);
router.get('/monthly', getMonthlyReport);
router.get('/vitals-history', getVitalsHistory);

module.exports = router;
