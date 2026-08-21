const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  getHealthProfile,
  createHealthProfile,
  updateHealthProfile,
} = require('../controllers/healthProfileController');

router.use(protect);

router.route('/')
  .get(getHealthProfile)
  .post(createHealthProfile)
  .put(updateHealthProfile);

module.exports = router;
