const HealthRecord = require('../models/HealthRecord');
const DailyTask = require('../models/DailyTask');
const { toDateKey } = require('../utils/date');

const getWeeklyReport = async (req, res) => {
  try {
    const userId = req.user._id;
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    const weekStart = new Date(today);
    weekStart.setDate(weekStart.getDate() - 6);
    weekStart.setHours(0, 0, 0, 0);

    const records = await HealthRecord.find({
      user: userId,
      recordDate: { $gte: weekStart, $lte: today },
    }).sort({ recordDate: 1 });

    const tasks = await DailyTask.find({
      user: userId,
      taskDate: { $gte: weekStart, $lte: today },
    });

    const totalTasks = tasks.length;
    const completedTasks = tasks.filter((t) => t.completed).length;
    const taskCompletionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    let avgBpSystolic = 0;
    let avgBpDiastolic = 0;
    let avgSugar = 0;
    let avgHeartRate = 0;
    let avgSleep = 0;
    let totalWater = 0;
    let totalExercise = 0;
    let avgBMI = 0;

    if (records.length > 0) {
      const withVitals = records.filter((r) => r.vitals && r.vitals.bpSystolic);
      if (withVitals.length > 0) {
        avgBpSystolic = Math.round(withVitals.reduce((s, r) => s + r.vitals.bpSystolic, 0) / withVitals.length);
        avgBpDiastolic = Math.round(withVitals.reduce((s, r) => s + r.vitals.bpDiastolic, 0) / withVitals.length);
        avgHeartRate = Math.round(withVitals.reduce((s, r) => s + (r.vitals.heartRate || 0), 0) / withVitals.length);
      }

      const withSugar = records.filter((r) => r.vitals && r.vitals.sugarFasting);
      if (withSugar.length > 0) {
        avgSugar = Math.round(withSugar.reduce((s, r) => s + r.vitals.sugarFasting, 0) / withSugar.length);
      }

      const withBMI = records.filter((r) => r.bmi);
      if (withBMI.length > 0) {
        avgBMI = Math.round(withBMI.reduce((s, r) => s + r.bmi, 0) / withBMI.length * 10) / 10;
      }

      avgSleep = records.filter((r) => r.sleepHours).reduce((s, r) => s + r.sleepHours, 0) / records.length || 0;
      totalWater = records.reduce((s, r) => s + (r.waterIntake || 0), 0);
      totalExercise = records.reduce((s, r) => s + (r.exerciseMinutes || 0), 0);
    }

    const dailyBreakdown = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dayKey = toDateKey(d);
      const dayRecords = records.filter((r) => toDateKey(r.recordDate) === dayKey);
      const dayTasks = tasks.filter((t) => toDateKey(t.taskDate) === dayKey);
      const dayCompleted = dayTasks.filter((t) => t.completed).length;

      dailyBreakdown.push({
        date: dayKey,
        day: d.toLocaleDateString('en-US', { weekday: 'short' }),
        recordsLogged: dayRecords.length,
        tasksCompleted: dayCompleted,
        tasksTotal: dayTasks.length,
      });
    }

    return res.json({
      period: { start: weekStart, end: today },
      summary: {
        totalRecords: records.length,
        totalTasks,
        completedTasks,
        taskCompletionRate,
        avgBpSystolic,
        avgBpDiastolic,
        avgSugar,
        avgHeartRate,
        avgBMI: avgBMI || 0,
        avgSleepHours: Math.round(avgSleep * 10) / 10,
        totalWaterIntake: Math.round(totalWater * 10) / 10,
        totalExerciseMinutes: totalExercise,
      },
      dailyBreakdown,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const getMonthlyReport = async (req, res) => {
  try {
    const userId = req.user._id;
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    monthStart.setHours(0, 0, 0, 0);

    const records = await HealthRecord.find({
      user: userId,
      recordDate: { $gte: monthStart, $lte: today },
    }).sort({ recordDate: 1 });

    const tasks = await DailyTask.find({
      user: userId,
      taskDate: { $gte: monthStart, $lte: today },
    });

    const totalTasks = tasks.length;
    const completedTasks = tasks.filter((t) => t.completed).length;
    const taskCompletionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    let avgBpSystolic = 0;
    let avgBpDiastolic = 0;
    let avgSugar = 0;
    let avgBMI = 0;
    let avgSleep = 0;
    let totalWater = 0;
    let totalExercise = 0;

    if (records.length > 0) {
      const withVitals = records.filter((r) => r.vitals && r.vitals.bpSystolic);
      if (withVitals.length > 0) {
        avgBpSystolic = Math.round(withVitals.reduce((s, r) => s + r.vitals.bpSystolic, 0) / withVitals.length);
        avgBpDiastolic = Math.round(withVitals.reduce((s, r) => s + r.vitals.bpDiastolic, 0) / withVitals.length);
      }

      const withSugar = records.filter((r) => r.vitals && r.vitals.sugarFasting);
      if (withSugar.length > 0) {
        avgSugar = Math.round(withSugar.reduce((s, r) => s + r.vitals.sugarFasting, 0) / withSugar.length);
      }

      const withBMI = records.filter((r) => r.bmi);
      if (withBMI.length > 0) {
        avgBMI = Math.round(withBMI.reduce((s, r) => s + r.bmi, 0) / withBMI.length * 10) / 10;
      }

      avgSleep = records.filter((r) => r.sleepHours).reduce((s, r) => s + r.sleepHours, 0) / records.length || 0;
      totalWater = records.reduce((s, r) => s + (r.waterIntake || 0), 0);
      totalExercise = records.reduce((s, r) => s + (r.exerciseMinutes || 0), 0);
    }

    const weeklyBreakdown = [];
    const weeksInMonth = 4;
    for (let w = 0; w < weeksInMonth; w++) {
      const weekStart2 = new Date(monthStart);
      weekStart2.setDate(weekStart2.getDate() + w * 7);
      const weekEnd = new Date(weekStart2);
      weekEnd.setDate(weekEnd.getDate() + 6);
      if (weekEnd > today) break;

      const weekRecords = records.filter((r) => {
        const d = new Date(r.recordDate);
        return d >= weekStart2 && d <= weekEnd;
      });
      const weekTasks = tasks.filter((t) => {
        const d = new Date(t.taskDate);
        return d >= weekStart2 && d <= weekEnd;
      });

      weeklyBreakdown.push({
        week: w + 1,
        start: toDateKey(weekStart2),
        end: toDateKey(weekEnd),
        recordsLogged: weekRecords.length,
        tasksCompleted: weekTasks.filter((t) => t.completed).length,
        tasksTotal: weekTasks.length,
      });
    }

    return res.json({
      period: { start: monthStart, end: today },
      summary: {
        totalRecords: records.length,
        totalTasks,
        completedTasks,
        taskCompletionRate,
        avgBpSystolic,
        avgBpDiastolic,
        avgSugar,
        avgBMI: avgBMI || 0,
        avgSleepHours: Math.round(avgSleep * 10) / 10,
        totalWaterIntake: Math.round(totalWater * 10) / 10,
        totalExerciseMinutes: totalExercise,
      },
      weeklyBreakdown,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const getVitalsHistory = async (req, res) => {
  try {
    const { days = 7 } = req.query;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - Number(days));
    startDate.setHours(0, 0, 0, 0);

    const records = await HealthRecord.find({
      user: req.user._id,
      recordDate: { $gte: startDate },
    }).sort({ recordDate: 1 });

    const history = records.map((r) => ({
      date: toDateKey(r.recordDate),
      bpSystolic: r.vitals?.bpSystolic || 0,
      bpDiastolic: r.vitals?.bpDiastolic || 0,
      sugar: r.vitals?.sugarFasting || 0,
      heartRate: r.vitals?.heartRate || 0,
      bmi: r.bmi || 0,
      sleepHours: r.sleepHours || 0,
      waterIntake: r.waterIntake || 0,
      exerciseMinutes: r.exerciseMinutes || 0,
      caloriesIntake: r.caloriesIntake || 0,
      weight: r.weight || 0,
      mood: r.mood || '',
    }));

    return res.json(history);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getWeeklyReport,
  getMonthlyReport,
  getVitalsHistory,
};
