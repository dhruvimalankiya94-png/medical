import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Loader2, Calendar, Activity } from 'lucide-react';
import { dailyTasksAPI, reportsAPI } from '../../services/api';
import Alert from '../../components/common/Alert';

const ProgressTracking = () => {
  const [taskHistory, setTaskHistory] = useState([]);
  const [vitalsHistory, setVitalsHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alertState, setAlertState] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [tasks, vitals] = await Promise.all([
        dailyTasksAPI.getHistory(90).catch(() => []),
        reportsAPI.getVitalsHistory(30).catch(() => []),
      ]);
      setTaskHistory(Array.isArray(tasks) ? tasks : []);
      setVitalsHistory(Array.isArray(vitals) ? vitals : []);
    } catch (err) {
      setAlertState({ type: 'warning', title: 'Notice', message: 'Some data could not be loaded' });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center py-24"><Loader2 className="w-6 h-6 animate-spin text-brand-500" /></div>;
  }

  const todayRate = taskHistory.length > 0 ? taskHistory[taskHistory.length - 1]?.completionRate || 0 : 0;
  const weekRate = taskHistory.length >= 7
    ? Math.round(taskHistory.slice(-7).reduce((s, d) => s + d.completionRate, 0) / 7) : todayRate;
  const monthRate = taskHistory.length > 0
    ? Math.round(taskHistory.reduce((s, d) => s + d.completionRate, 0) / taskHistory.length) : 0;

  const rings = [
    { label: 'Daily Goal', value: todayRate, color: '#10b981' },
    { label: 'Weekly Target', value: weekRate, color: '#06b6d4' },
    { label: 'Monthly Consistency', value: monthRate, color: '#8b5cf6' },
  ];

  const heatmapData = taskHistory.slice(-90);

  const intensityColors = [
    'bg-slate-100 dark:bg-slate-800',
    'bg-emerald-200 dark:bg-emerald-900/40',
    'bg-emerald-300 dark:bg-emerald-700/50',
    'bg-emerald-400 dark:bg-emerald-500/60',
    'bg-emerald-500 dark:bg-emerald-500',
  ];

  return (
    <div className="space-y-8">
      {alertState && <Alert type={alertState.type} title={alertState.title} message={alertState.message} onClose={() => setAlertState(null)} />}

      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/10 text-brand-500 text-xs font-semibold border border-brand-500/30 mb-2">
          <TrendingUp className="w-3.5 h-3.5" />
          <span>Progress & Consistency Tracking</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">Progress Tracking</h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">Monitor your health journey over time</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {rings.map((ring, idx) => {
          const radius = 50;
          const circ = 2 * Math.PI * radius;
          const offset = circ - (ring.value / 100) * circ;
          return (
            <motion.div key={ring.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1 }}
              className="glass-panel p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 flex flex-col items-center space-y-3">
              <svg width="130" height="130" viewBox="0 0 130 130">
                <circle cx="65" cy="65" r={radius} fill="none" stroke="currentColor" strokeWidth="10" className="text-slate-200 dark:text-slate-800" />
                <circle cx="65" cy="65" r={radius} fill="none" stroke={ring.color} strokeWidth="10" strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={offset} transform="rotate(-90 65 65)" style={{ transition: 'stroke-dashoffset 0.6s ease' }} />
              </svg>
              <div className="text-center">
                <p className="text-2xl font-black text-slate-900 dark:text-white">{ring.value}%</p>
                <p className="text-[10px] text-slate-400 font-semibold">{ring.label}</p>
              </div>
            </motion.div>
          );
        })}
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
        className="glass-panel p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800/80">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4">Activity Heatmap (Last 90 Days)</h3>
        <div className="grid grid-cols-[repeat(auto-fill,minmax(14px,1fr))] gap-1">
          {heatmapData.map((day, i) => {
            const level = day.completionRate === 0 ? 0 : day.completionRate <= 25 ? 1 : day.completionRate <= 50 ? 2 : day.completionRate <= 75 ? 3 : 4;
            return (
              <motion.div key={day.date} initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.005 }}
                className={`w-full aspect-square rounded-sm ${intensityColors[level]}`}
                title={`${day.date}: ${day.completionRate}% completion`}
              />
            );
          })}
        </div>
        <div className="flex items-center justify-end gap-2 mt-3">
          <span className="text-[9px] text-slate-400">Less</span>
          {intensityColors.map((c, i) => <div key={i} className={`w-3 h-3 rounded-sm ${c}`} />)}
          <span className="text-[9px] text-slate-400">More</span>
        </div>
      </motion.div>

      {vitalsHistory.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
          className="glass-panel p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800/80">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4">Recent Activity</h3>
          <div className="space-y-3">
            {vitalsHistory.slice(-5).reverse().map((v, i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800">
                <div className="w-8 h-8 rounded-lg bg-brand-500/20 flex items-center justify-center">
                  <Activity className="w-4 h-4 text-brand-400" />
                </div>
                <div className="flex-1">
                  <p className="text-xs font-bold text-slate-900 dark:text-white">{v.date}</p>
                  <p className="text-[10px] text-slate-400">
                    BP: {v.bpSystolic}/{v.bpDiastolic} | Sugar: {v.sugar} | Sleep: {v.sleepHours}h | Water: {v.waterIntake}L
                  </p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default ProgressTracking;
