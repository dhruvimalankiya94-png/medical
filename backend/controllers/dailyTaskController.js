const DailyTask = require('../models/DailyTask');

const getDailyTasks = async (req, res) => {
  try {
    const { date } = req.query;
    const filter = { user: req.user._id };

    if (date) {
      const start = new Date(date);
      start.setHours(0, 0, 0, 0);
      const end = new Date(date);
      end.setHours(23, 59, 59, 999);
      filter.taskDate = { $gte: start, $lte: end };
    } else {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      filter.taskDate = { $gte: today, $lt: tomorrow };
    }

    const tasks = await DailyTask.find(filter).sort({ createdAt: 1 });
    return res.json(tasks);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const createDailyTask = async (req, res) => {
  try {
    const { title, category, targetValue, unit, taskDate } = req.body;
    if (!title) {
      return res.status(400).json({ message: 'Task title is required' });
    }

    const task = await DailyTask.create({
      user: req.user._id,
      title,
      category: category || 'other',
      targetValue: targetValue || 1,
      unit: unit || '',
      taskDate: taskDate || new Date(),
    });

    return res.status(201).json(task);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const updateDailyTask = async (req, res) => {
  try {
    const task = await DailyTask.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    if (task.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const { completed, title, category, currentValue } = req.body;
    if (completed !== undefined) task.completed = completed;
    if (title !== undefined) task.title = title;
    if (category !== undefined) task.category = category;
    if (currentValue !== undefined) task.currentValue = currentValue;

    const updated = await task.save();
    return res.json(updated);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const deleteDailyTask = async (req, res) => {
  try {
    const task = await DailyTask.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    if (task.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await task.deleteOne();
    return res.json({ message: 'Task deleted' });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const getStreak = async (req, res) => {
  try {
    const userId = req.user._id;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const allTasks = await DailyTask.find({ user: userId }).sort({ taskDate: -1 });
    if (allTasks.length === 0) {
      return res.json({
        currentStreak: 0,
        longestStreak: 0,
        weeklyStreak: 0,
        monthlyStreak: 0,
      });
    }

    const dateMap = {};
    allTasks.forEach((task) => {
      const dateKey = new Date(task.taskDate).toISOString().split('T')[0];
      if (!dateMap[dateKey]) dateMap[dateKey] = { total: 0, completed: 0 };
      dateMap[dateKey].total += 1;
      if (task.completed) dateMap[dateKey].completed += 1;
    });

    const sortedDates = Object.keys(dateMap).sort().reverse();

    let currentStreak = 0;
    let checkDate = new Date(today);
    for (let i = 0; i < 365; i++) {
      const key = checkDate.toISOString().split('T')[0];
      const dayData = dateMap[key];
      if (dayData && dayData.completed === dayData.total && dayData.total > 0) {
        currentStreak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else if (i === 0) {
        checkDate.setDate(checkDate.getDate() - 1);
        continue;
      } else {
        break;
      }
    }

    let longestStreak = 0;
    let tempStreak = 0;
    const allDatesSorted = Object.keys(dateMap).sort();
    for (let i = 0; i < allDatesSorted.length; i++) {
      const dayData = dateMap[allDatesSorted[i]];
      if (dayData.completed === dayData.total && dayData.total > 0) {
        tempStreak++;
        if (tempStreak > longestStreak) longestStreak = tempStreak;
      } else {
        tempStreak = 0;
      }
    }

    let weeklyStreak = 0;
    const weekStart = new Date(today);
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    for (let i = 0; i < 7; i++) {
      const d = new Date(weekStart);
      d.setDate(d.getDate() + i);
      if (d > today) break;
      const key = d.toISOString().split('T')[0];
      const dayData = dateMap[key];
      if (dayData && dayData.completed === dayData.total && dayData.total > 0) {
        weeklyStreak++;
      }
    }

    let monthlyStreak = 0;
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    for (let d = new Date(monthStart); d <= today; d.setDate(d.getDate() + 1)) {
      const key = d.toISOString().split('T')[0];
      const dayData = dateMap[key];
      if (dayData && dayData.completed === dayData.total && dayData.total > 0) {
        monthlyStreak++;
      }
    }

    return res.json({
      currentStreak,
      longestStreak,
      weeklyStreak,
      monthlyStreak,
      totalTasks: allTasks.length,
      completedTasks: allTasks.filter((t) => t.completed).length,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const getTaskHistory = async (req, res) => {
  try {
    const { days = 30 } = req.query;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - Number(days));
    startDate.setHours(0, 0, 0, 0);

    const tasks = await DailyTask.find({
      user: req.user._id,
      taskDate: { $gte: startDate },
    }).sort({ taskDate: 1 });

    const dateMap = {};
    tasks.forEach((task) => {
      const key = new Date(task.taskDate).toISOString().split('T')[0];
      if (!dateMap[key]) dateMap[key] = { total: 0, completed: 0 };
      dateMap[key].total += 1;
      if (task.completed) dateMap[key].completed += 1;
    });

    const history = [];
    for (let i = 0; i < Number(days); i++) {
      const d = new Date(startDate);
      d.setDate(d.getDate() + i);
      const key = d.toISOString().split('T')[0];
      const data = dateMap[key] || { total: 0, completed: 0 };
      history.push({
        date: key,
        total: data.total,
        completed: data.completed,
        completionRate: data.total > 0 ? Math.round((data.completed / data.total) * 100) : 0,
      });
    }

    return res.json(history);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getDailyTasks,
  createDailyTask,
  updateDailyTask,
  deleteDailyTask,
  getStreak,
  getTaskHistory,
};
