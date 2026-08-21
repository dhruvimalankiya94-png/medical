const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  createHealthRecord,
  getHealthRecords,
  getHealthRecordById,
  updateHealthRecord,
  deleteHealthRecord,
} = require('../controllers/recordController');

router.use(protect);

router.route('/')
  .post(createHealthRecord)
  .get(getHealthRecords);

router.route('/:id')
  .get(getHealthRecordById)
  .put(updateHealthRecord)
  .delete(deleteHealthRecord);

module.exports = router;
