const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  getDailyTasks,
  createDailyTask,
  updateDailyTask,
  deleteDailyTask,
  getStreak,
  getTaskHistory,
} = require('../controllers/dailyTaskController');

router.use(protect);

router.get('/streak', getStreak);
router.get('/history', getTaskHistory);
router.route('/')
  .get(getDailyTasks)
  .post(createDailyTask);

router.route('/:id')
  .put(updateDailyTask)
  .delete(deleteDailyTask);

module.exports = router;
