const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { exportRecordsCsv, exportAllJson } = require('../controllers/exportController');

router.use(protect);

router.get('/records.csv', exportRecordsCsv);
router.get('/all.json', exportAllJson);

module.exports = router;
