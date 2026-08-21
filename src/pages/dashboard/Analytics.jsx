import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { LineChart, Line, BarChart, Bar, AreaChart, Area, PieChart, Pie, Cell, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { LineChart as LineIcon, Loader2 } from 'lucide-react';
import { reportsAPI } from '../../services/api';
import Alert from '../../components/common/Alert';

const COLORS = ['#10b981', '#06b6d4', '#f59e0b', '#ef4444'];

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload) return null;
  return (
    <div className="bg-slate-900 dark:bg-slate-800 p-3 rounded-xl border border-slate-700 shadow-xl">
      <p className="text-xs font-bold text-white mb-1">{label}</p>
      {payload.map((entry, i) => (
        <p key={i} className="text-[10px] font-semibold" style={{ color: entry.color }}>{entry.name}: {entry.value}</p>
      ))}
    </div>
  );
};

const Analytics = () => {
  const [vitalsData, setVitalsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alertState, setAlertState] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const data = await reportsAPI.getVitalsHistory(30);
      const formatted = (Array.isArray(data) ? data : []).map((d) => ({
        ...d,
        date: d.date?.slice(5) || '',
      }));
      setVitalsData(formatted);
    } catch (err) {
      setAlertState({ type: 'warning', title: 'Notice', message: 'No vitals data yet. Add health records to see charts.' });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center py-24"><Loader2 className="w-6 h-6 animate-spin text-brand-500" /></div>;
  }

  return (
    <div className="space-y-8">
      {alertState && <Alert type={alertState.type} title={alertState.title} message={alertState.message} onClose={() => setAlertState(null)} />}

      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/10 text-brand-500 text-xs font-semibold border border-brand-500/30 mb-2">
          <LineIcon className="w-3.5 h-3.5" />
          <span>Health Analytics Dashboard</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">Analytics</h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">Visualize your health trends over time</p>
      </div>

      {vitalsData.length === 0 ? (
        <div className="glass-panel p-12 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 text-center">
          <LineIcon className="w-12 h-12 text-slate-400 mx-auto mb-3" />
          <p className="text-sm font-bold text-slate-900 dark:text-white">No data available yet</p>
          <p className="text-xs text-slate-400 mt-1">Add health records to see your analytics charts</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-panel p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800/80">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4">Blood Pressure & Sugar Trend</h3>
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={vitalsData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#94a3b8' }} />
                  <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Line type="monotone" dataKey="bpSystolic" stroke="#10b981" strokeWidth={2} name="BP Systolic" dot={false} />
                  <Line type="monotone" dataKey="bpDiastolic" stroke="#34d399" strokeWidth={2} name="BP Diastolic" dot={false} />
                  <Line type="monotone" dataKey="sugar" stroke="#f59e0b" strokeWidth={2} name="Sugar" dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-panel p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800/80">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4">Heart Rate Trend</h3>
              <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={vitalsData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#94a3b8' }} />
                  <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="heartRate" stroke="#06b6d4" fill="rgba(6,182,212,0.15)" strokeWidth={2} name="Heart Rate" />
                </AreaChart>
              </ResponsiveContainer>
            </motion.div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-panel p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800/80">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4">Water Intake & Sleep</h3>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={vitalsData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#94a3b8' }} />
                  <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="waterIntake" fill="#06b6d4" name="Water (L)" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="sleepHours" fill="#8b5cf6" name="Sleep (hrs)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glass-panel p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800/80">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4">BMI & Weight Trend</h3>
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={vitalsData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#94a3b8' }} />
                  <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Line type="monotone" dataKey="bmi" stroke="#10b981" strokeWidth={2} name="BMI" dot={false} />
                  <Line type="monotone" dataKey="weight" stroke="#f59e0b" strokeWidth={2} name="Weight (kg)" dot={false} yAxisId={0} />
                </LineChart>
              </ResponsiveContainer>
            </motion.div>
          </div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="glass-panel p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800/80">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4">Exercise & Calorie Intake</h3>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={vitalsData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#94a3b8' }} />
                <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="exerciseMinutes" fill="#10b981" name="Exercise (min)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="caloriesIntake" fill="#f59e0b" name="Calories" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>
        </>
      )}
    </div>
  );
};

export default Analytics;
