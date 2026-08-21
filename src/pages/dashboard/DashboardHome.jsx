import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Activity, Droplets, Moon, Dumbbell, Flame, CheckCircle2, Plus, LineChart, Loader2, ArrowRight, CalendarCheck, Heart } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { dashboardAPI, recordsAPI } from '../../services/api';
import HealthScoreMeter from '../../components/dashboard/HealthScoreMeter';
import BmiGauge from '../../components/dashboard/BmiGauge';

const DashboardHome = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [recentRecords, setRecentRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [statsData, recordsData] = await Promise.all([
        dashboardAPI.getStats().catch(() => null),
        recordsAPI.getAll({ page: 1, limit: 5 }).catch(() => ({ records: [] })),
      ]);
      setStats(statsData);
      setRecentRecords(recordsData?.records || []);
    } catch (err) {
      // silent
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="w-6 h-6 animate-spin text-brand-500" />
        <span className="ml-2 text-sm text-slate-500">Loading dashboard...</span>
      </div>
    );
  }

  const statCards = [
    { title: 'Health Score', value: stats?.healthScore || 0, suffix: '/100', icon: Heart, color: 'from-brand-500 to-emerald-500', link: '/analytics' },
    { title: 'BMI', value: stats?.bmi || '--', suffix: '', icon: Activity, color: 'from-cyan-500 to-blue-500', link: '/records' },
    { title: 'Water Intake', value: stats?.waterIntake || 0, suffix: `/${stats?.waterGoal || 3}L`, icon: Droplets, color: 'from-blue-500 to-cyan-500', link: '/planner' },
    { title: 'Sleep', value: stats?.sleepHours || 0, suffix: 'hrs', icon: Moon, color: 'from-indigo-500 to-purple-500', link: '/planner' },
    { title: 'Exercise', value: stats?.exerciseMinutes || 0, suffix: 'min', icon: Dumbbell, color: 'from-emerald-500 to-teal-500', link: '/planner' },
    { title: 'Tasks Done', value: `${stats?.tasksCompleted || 0}/${stats?.tasksTotal || 0}`, suffix: '', icon: CheckCircle2, color: 'from-amber-500 to-orange-500', link: '/planner' },
    { title: 'Streak', value: stats?.currentStreak || 0, suffix: 'Days', icon: Flame, color: 'from-rose-500 to-orange-500', link: '/streak' },
    { title: 'Records', value: stats?.totalRecords || 0, suffix: 'total', icon: CalendarCheck, color: 'from-purple-500 to-pink-500', link: '/records' },
  ];

  return (
    <div className="space-y-8">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="glass-panel p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">Welcome back, {user?.name || 'User'}!</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Here is your health summary for today</p>
        </div>
        <div className="flex gap-2">
          <Link to="/records/add" className="px-4 py-2 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-xs font-bold flex items-center gap-2 transition-all">
            <Plus className="w-4 h-4" /> Log Record
          </Link>
          <Link to="/analytics" className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2 transition-all">
            <LineChart className="w-4 h-4" /> Analytics
          </Link>
        </div>
      </motion.div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {statCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <Link key={card.title} to={card.link}>
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }}
                className="glass-panel p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 hover:border-brand-500/50 transition-all group">
                <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${card.color} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                  <Icon className="w-4 h-4 text-white" />
                </div>
                <p className="text-xl font-black text-slate-900 dark:text-white">{card.value}<span className="text-xs font-bold text-slate-400 ml-1">{card.suffix}</span></p>
                <p className="text-[10px] text-slate-400 font-semibold mt-0.5">{card.title}</p>
              </motion.div>
            </Link>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-4 space-y-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            className="glass-panel p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800/80">
            <h3 className="text-xs font-bold text-slate-900 dark:text-white mb-4">Health Score</h3>
            <HealthScoreMeter score={stats?.healthScore || 0} />
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
            className="glass-panel p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800/80">
            <h3 className="text-xs font-bold text-slate-900 dark:text-white mb-4">BMI Overview</h3>
            <BmiGauge bmi={stats?.bmi || 0} status={stats?.bmi ? (stats.bmi < 18.5 ? 'Underweight' : stats.bmi <= 24.9 ? 'Normal' : stats.bmi <= 29.9 ? 'Overweight' : 'Obese') : 'No Data'} />
          </motion.div>
        </div>

        <div className="lg:col-span-8 space-y-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
            className="glass-panel p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800/80">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-bold text-slate-900 dark:text-white">Recent Health Records</h3>
              <Link to="/records" className="text-[10px] font-bold text-brand-500 hover:text-brand-600 flex items-center gap-1">View All <ArrowRight className="w-3 h-3" /></Link>
            </div>
            {recentRecords.length === 0 ? (
              <div className="text-center py-8">
                <CalendarCheck className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                <p className="text-xs font-bold text-slate-900 dark:text-white">No records yet</p>
                <Link to="/records/add" className="text-[10px] text-brand-500 font-semibold hover:underline mt-1 inline-block">Add your first record</Link>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-800">
                      <th className="text-left py-2 px-2 font-bold text-slate-500">Date</th>
                      <th className="text-center py-2 px-2 font-bold text-slate-500">BP</th>
                      <th className="text-center py-2 px-2 font-bold text-slate-500">Sugar</th>
                      <th className="text-center py-2 px-2 font-bold text-slate-500">BMI</th>
                      <th className="text-center py-2 px-2 font-bold text-slate-500">Sleep</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentRecords.map((r) => (
                      <tr key={r._id} className="border-b border-slate-100 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors">
                        <td className="py-2 px-2 font-semibold text-slate-900 dark:text-white">{new Date(r.recordDate || r.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}</td>
                        <td className="py-2 px-2 text-center text-slate-600 dark:text-slate-300">{r.vitals?.bpSystolic || '-'}/{r.vitals?.bpDiastolic || '-'}</td>
                        <td className="py-2 px-2 text-center text-slate-600 dark:text-slate-300">{r.vitals?.sugarFasting || '-'}</td>
                        <td className="py-2 px-2 text-center text-slate-600 dark:text-slate-300">{r.bmi || '-'}</td>
                        <td className="py-2 px-2 text-center text-slate-600 dark:text-slate-300">{r.sleepHours || '-'}h</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}
            className="glass-panel p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800/80">
            <h3 className="text-xs font-bold text-slate-900 dark:text-white mb-4">Quick Actions</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: 'Add Record', path: '/records/add', icon: Plus, color: 'bg-brand-500/20 text-brand-400' },
                { label: 'Daily Tasks', path: '/planner', icon: CalendarCheck, color: 'bg-cyan-500/20 text-cyan-400' },
                { label: 'Analytics', path: '/analytics', icon: LineChart, color: 'bg-purple-500/20 text-purple-400' },
                { label: 'Risk Check', path: '/risk-assessment', icon: Activity, color: 'bg-amber-500/20 text-amber-400' },
              ].map((action) => {
                const Icon = action.icon;
                return (
                  <Link key={action.path} to={action.path} className="glass-card p-4 rounded-2xl border text-center hover:scale-105 transition-all">
                    <div className={`w-10 h-10 rounded-xl ${action.color} flex items-center justify-center mx-auto mb-2`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-bold text-slate-900 dark:text-white">{action.label}</span>
                  </Link>
                );
              })}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default DashboardHome;
