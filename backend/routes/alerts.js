const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { getAlerts, getThresholds } = require('../controllers/alertController');

router.use(protect);

router.get('/thresholds', getThresholds);
router.get('/', getAlerts);

module.exports = router;
