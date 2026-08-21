import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Flame, Trophy, Calendar, TrendingUp, Loader2, Star } from 'lucide-react';
import { dailyTasksAPI } from '../../services/api';
import Alert from '../../components/common/Alert';

const Streak = () => {
  const [streakData, setStreakData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [alertState, setAlertState] = useState(null);

  useEffect(() => {
    fetchStreak();
  }, []);

  const fetchStreak = async () => {
    try {
      const data = await dailyTasksAPI.getStreak();
      setStreakData(data);
    } catch (err) {
      setAlertState({ type: 'error', title: 'Error', message: 'Failed to load streak data' });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="w-6 h-6 animate-spin text-brand-500" />
      </div>
    );
  }

  const metrics = [
    { label: 'Current Streak', value: streakData?.currentStreak || 0, suffix: 'Days', icon: Flame, color: 'from-amber-500 to-orange-500', desc: 'Consecutive days with all tasks done' },
    { label: 'Longest Streak', value: streakData?.longestStreak || 0, suffix: 'Days', icon: Trophy, color: 'from-yellow-500 to-amber-500', desc: 'Your all-time best streak' },
    { label: 'This Week', value: `${streakData?.weeklyStreak || 0}/7`, suffix: '', icon: Calendar, color: 'from-emerald-500 to-teal-500', desc: 'Days completed this week' },
    { label: 'This Month', value: `${streakData?.monthlyStreak || 0}`, suffix: 'Days', icon: TrendingUp, color: 'from-cyan-500 to-blue-500', desc: 'Days completed this month' },
  ];

  const completionRate = streakData?.totalTasks > 0
    ? Math.round((streakData.completedTasks / streakData.totalTasks) * 100) : 0;

  return (
    <div className="space-y-8">
      {alertState && (
        <Alert type={alertState.type} title={alertState.title} message={alertState.message} onClose={() => setAlertState(null)} />
      )}

      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 text-amber-500 text-xs font-semibold border border-amber-500/30 mb-2">
          <Flame className="w-3.5 h-3.5" />
          <span>Streak & Consistency</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">Your Streaks</h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">Track your daily health consistency</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((m, idx) => {
          const Icon = m.icon;
          return (
            <motion.div key={m.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1 }}
              className="glass-panel p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 space-y-4">
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${m.color} flex items-center justify-center`}>
                <Icon className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-3xl font-black text-slate-900 dark:text-white">{m.value}<span className="text-sm font-bold text-slate-400 ml-1">{m.suffix}</span></p>
                <p className="text-xs font-bold text-slate-500 dark:text-slate-400 mt-1">{m.label}</p>
                <p className="text-[10px] text-slate-400 mt-0.5">{m.desc}</p>
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="glass-panel p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800/80">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">Overall Performance</h3>
          <span className="text-xs font-bold text-brand-500">{completionRate}% completion rate</span>
        </div>
        <div className="h-3 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-brand-500 to-cyan-400 rounded-full transition-all duration-500" style={{ width: `${completionRate}%` }} />
        </div>
        <p className="text-xs text-slate-400 mt-2">{streakData?.completedTasks || 0} of {streakData?.totalTasks || 0} total tasks completed</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
          className="glass-panel p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800/80">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-yellow-500 to-amber-500 flex items-center justify-center">
              <Trophy className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Health Vanguard</h3>
              <p className="text-[10px] text-slate-400">30-day consistency milestone</p>
            </div>
          </div>
          <div className={`p-3 rounded-2xl ${(streakData?.longestStreak || 0) >= 30 ? 'bg-amber-500/10 border border-amber-500/30' : 'bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 opacity-50'}`}>
            <div className="flex items-center gap-2">
              <Star className={`w-4 h-4 ${(streakData?.longestStreak || 0) >= 30 ? 'text-amber-400' : 'text-slate-400'}`} />
              <span className={`text-xs font-bold ${(streakData?.longestStreak || 0) >= 30 ? 'text-amber-400' : 'text-slate-400'}`}>
                {(streakData?.longestStreak || 0) >= 30 ? 'Unlocked' : `Need ${30 - (streakData?.longestStreak || 0)} more days`}
              </span>
            </div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
          className="glass-panel p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800/80">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
              <Flame className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Momentum Builder</h3>
              <p className="text-[10px] text-slate-400">14-day streak milestone</p>
            </div>
          </div>
          <div className={`p-3 rounded-2xl ${(streakData?.longestStreak || 0) >= 14 ? 'bg-emerald-500/10 border border-emerald-500/30' : 'bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 opacity-50'}`}>
            <div className="flex items-center gap-2">
              <Star className={`w-4 h-4 ${(streakData?.longestStreak || 0) >= 14 ? 'text-emerald-400' : 'text-slate-400'}`} />
              <span className={`text-xs font-bold ${(streakData?.longestStreak || 0) >= 14 ? 'text-emerald-400' : 'text-slate-400'}`}>
                {(streakData?.longestStreak || 0) >= 14 ? 'Unlocked' : `Need ${14 - (streakData?.longestStreak || 0)} more days`}
              </span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Streak;
