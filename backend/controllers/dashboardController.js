const HealthRecord = require('../models/HealthRecord');
const DailyTask = require('../models/DailyTask');
const HealthProfile = require('../models/HealthProfile');

const getDashboardStats = async (req, res) => {
  try {
    const userId = req.user._id;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todayTasks = await DailyTask.find({
      user: userId,
      taskDate: { $gte: today, $lt: tomorrow },
    });

    const todayCompleted = todayTasks.filter((t) => t.completed).length;
    const todayTotal = todayTasks.length;

    const allTasks = await DailyTask.find({ user: userId }).sort({ taskDate: -1 });

    const dateMap = {};
    allTasks.forEach((task) => {
      const dateKey = new Date(task.taskDate).toISOString().split('T')[0];
      if (!dateMap[dateKey]) dateMap[dateKey] = { total: 0, completed: 0 };
      dateMap[dateKey].total += 1;
      if (task.completed) dateMap[dateKey].completed += 1;
    });

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

    const latestRecord = await HealthRecord.findOne({ user: userId }).sort({ createdAt: -1 });
    const totalRecords = await HealthRecord.countDocuments({ user: userId });

    const profile = await HealthProfile.findOne({ user: userId });

    let healthScore = 75;
    if (latestRecord) {
      healthScore = 75;
      if (latestRecord.vitals) {
        if (latestRecord.vitals.bpSystolic >= 90 && latestRecord.vitals.bpSystolic <= 130) healthScore += 5;
        if (latestRecord.vitals.bpDiastolic >= 60 && latestRecord.vitals.bpDiastolic <= 85) healthScore += 3;
        if (latestRecord.vitals.sugarFasting >= 70 && latestRecord.vitals.sugarFasting <= 100) healthScore += 5;
        if (latestRecord.vitals.heartRate >= 60 && latestRecord.vitals.heartRate <= 100) healthScore += 3;
        if (latestRecord.sleepHours >= 7 && latestRecord.sleepHours <= 9) healthScore += 4;
        if (latestRecord.waterIntake >= 2.5) healthScore += 3;
        if (latestRecord.exerciseMinutes >= 30) healthScore += 2;
      }
      if (latestRecord.bmi >= 18.5 && latestRecord.bmi <= 24.9) healthScore += 5;
      healthScore = Math.min(healthScore, 100);
    }

    const waterIntakeToday = latestRecord ? latestRecord.waterIntake || 0 : 0;
    const sleepHoursLast = latestRecord ? latestRecord.sleepHours || 0 : 0;
    const exerciseMinutesToday = latestRecord ? latestRecord.exerciseMinutes || 0 : 0;

    return res.json({
      healthScore,
      bmi: latestRecord?.bmi || (profile ? Math.round((profile.weight / ((profile.height / 100) ** 2)) * 10) / 10 : 0),
      waterIntake: waterIntakeToday,
      waterGoal: profile?.dailyWaterGoal || 3.0,
      sleepHours: sleepHoursLast,
      sleepGoal: profile?.dailySleepGoal || 8,
      exerciseMinutes: exerciseMinutesToday,
      exerciseGoal: profile?.dailyExerciseGoal || 45,
      tasksCompleted: todayCompleted,
      tasksTotal: todayTotal,
      currentStreak,
      totalRecords,
      latestRecord: latestRecord
        ? {
            _id: latestRecord._id,
            recordDate: latestRecord.recordDate,
            type: latestRecord.type,
            bmi: latestRecord.bmi,
            weight: latestRecord.weight,
            vitals: latestRecord.vitals,
            sleepHours: latestRecord.sleepHours,
            waterIntake: latestRecord.waterIntake,
            exerciseMinutes: latestRecord.exerciseMinutes,
            notes: latestRecord.notes,
          }
        : null,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = { getDashboardStats };
