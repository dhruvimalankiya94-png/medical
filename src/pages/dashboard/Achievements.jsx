import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Award, Loader2, Star, Lock, Unlock, Trophy } from 'lucide-react';
import { dailyTasksAPI, recordsAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import Alert from '../../components/common/Alert';

const Achievements = () => {
  const { user } = useAuth();
  const [streakData, setStreakData] = useState(null);
  const [recordCount, setRecordCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [alertState, setAlertState] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [streak, records] = await Promise.all([
        dailyTasksAPI.getStreak().catch(() => null),
        recordsAPI.getAll({ page: 1, limit: 1 }).catch(() => ({ pagination: { total: 0 } })),
      ]);
      setStreakData(streak);
      setRecordCount(records?.pagination?.total || 0);
    } catch (err) {
      setAlertState({ type: 'error', title: 'Error', message: 'Failed to load achievements data' });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center py-24"><Loader2 className="w-6 h-6 animate-spin text-brand-500" /></div>;
  }

  const longestStreak = streakData?.longestStreak || 0;
  const currentStreak = streakData?.currentStreak || 0;
  const completedTasks = streakData?.completedTasks || 0;

  const badges = [
    { id: 1, title: '7-Day Warrior', desc: 'Complete all tasks for 7 consecutive days', icon: '🔥', unlocked: longestStreak >= 7, color: 'from-orange-500 to-red-500' },
    { id: 2, title: '14-Day Champion', desc: 'Maintain a 14-day health streak', icon: '🏆', unlocked: longestStreak >= 14, color: 'from-amber-500 to-yellow-500' },
    { id: 3, title: '30-Day Legend', desc: 'Achieve a 30-day consistency streak', icon: '👑', unlocked: longestStreak >= 30, color: 'from-purple-500 to-pink-500' },
    { id: 4, title: 'Health Journalist', desc: 'Log 30 or more health records', icon: '📝', unlocked: recordCount >= 30, color: 'from-cyan-500 to-blue-500' },
    { id: 5, title: 'Task Master', desc: 'Complete 100 daily tasks total', icon: '⚡', unlocked: completedTasks >= 100, color: 'from-emerald-500 to-teal-500' },
    { id: 6, title: 'Active Starter', desc: 'Complete your first 10 tasks', icon: '🚀', unlocked: completedTasks >= 10, color: 'from-brand-500 to-cyan-500' },
    { id: 7, title: 'Current Streak Active', desc: 'Have an active streak of 3+ days', icon: '💪', unlocked: currentStreak >= 3, color: 'from-rose-500 to-orange-500' },
    { id: 8, title: 'Consistency Pro', desc: 'Complete tasks 5 days in a week', icon: '📅', unlocked: (streakData?.weeklyStreak || 0) >= 5, color: 'from-indigo-500 to-purple-500' },
  ];

  const unlockedCount = badges.filter((b) => b.unlocked).length;

  return (
    <div className="space-y-8">
      {alertState && <Alert type={alertState.type} title={alertState.title} message={alertState.message} onClose={() => setAlertState(null)} />}

      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 text-amber-500 text-xs font-semibold border border-amber-500/30 mb-2">
          <Award className="w-3.5 h-3.5" />
          <span>Achievements & Badges</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">Your Achievements</h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">{unlockedCount} of {badges.length} badges unlocked</p>
      </div>

      <div className="glass-panel p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800/80">
        <div className="h-3 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-amber-500 to-yellow-400 rounded-full transition-all duration-500" style={{ width: `${(unlockedCount / badges.length) * 100}%` }} />
        </div>
        <p className="text-xs text-slate-400 mt-2">{unlockedCount}/{badges.length} badges earned</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {badges.map((badge, idx) => (
          <motion.div key={badge.id} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: idx * 0.08 }}
            className={`glass-panel p-5 rounded-3xl border text-center space-y-3 transition-all ${badge.unlocked ? 'border-brand-500/30 shadow-glow-emerald' : 'border-slate-200/80 dark:border-slate-800/80 opacity-60'}`}>
            <div className={`w-14 h-14 mx-auto rounded-2xl bg-gradient-to-br ${badge.color} flex items-center justify-center text-2xl ${badge.unlocked ? 'shadow-lg' : 'grayscale'}`}>
              {badge.icon}
            </div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">{badge.title}</h3>
            <p className="text-[10px] text-slate-400 leading-relaxed">{badge.desc}</p>
            <div className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-bold ${badge.unlocked ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' : 'bg-slate-100 dark:bg-slate-900 text-slate-400 border border-slate-200 dark:border-slate-800'}`}>
              {badge.unlocked ? <><Unlock className="w-3 h-3" /> Unlocked</> : <><Lock className="w-3 h-3" /> Locked</>}
            </div>
          </motion.div>
        ))}
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}
        className="glass-panel p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 text-center space-y-3">
        <Trophy className="w-10 h-10 text-amber-400 mx-auto" />
        <h3 className="text-sm font-bold text-slate-900 dark:text-white">Health Consistency Certificate</h3>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Awarded to <span className="font-bold text-brand-500">{user?.name || 'Health Enthusiast'}</span> for achieving {unlockedCount} health milestone{unlockedCount !== 1 ? 's' : ''}
        </p>
        <p className="text-[10px] text-slate-400">Smart Healthcare Analytics System</p>
      </motion.div>
    </div>
  );
};

export default Achievements;
