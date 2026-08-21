import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CalendarCheck, Plus, Dumbbell, GlassWater, Pill, Footprints, Moon, Salad, Lightbulb, CheckCircle2, Circle, Trash2, Loader2 } from 'lucide-react';
import { dailyTasksAPI } from '../../services/api';
import Alert from '../../components/common/Alert';

const categoryConfig = {
  exercise: { icon: Dumbbell, color: 'text-emerald-400', bg: 'bg-emerald-500/20' },
  water: { icon: GlassWater, color: 'text-cyan-400', bg: 'bg-cyan-500/20' },
  medicine: { icon: Pill, color: 'text-rose-400', bg: 'bg-rose-500/20' },
  walking: { icon: Footprints, color: 'text-amber-400', bg: 'bg-amber-500/20' },
  sleep: { icon: Moon, color: 'text-indigo-400', bg: 'bg-indigo-500/20' },
  diet: { icon: Salad, color: 'text-lime-400', bg: 'bg-lime-500/20' },
  other: { icon: Lightbulb, color: 'text-slate-400', bg: 'bg-slate-500/20' },
};

const DailyPlanner = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskCategory, setNewTaskCategory] = useState('other');
  const [adding, setAdding] = useState(false);
  const [alertState, setAlertState] = useState(null);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const data = await dailyTasksAPI.getAll();
      setTasks(Array.isArray(data) ? data : []);
    } catch (err) {
      setAlertState({ type: 'error', title: 'Error', message: 'Failed to load tasks' });
    } finally {
      setLoading(false);
    }
  };

  const handleAddTask = async (e) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    setAdding(true);
    try {
      const task = await dailyTasksAPI.create({ title: newTaskTitle.trim(), category: newTaskCategory });
      setTasks((prev) => [...prev, task]);
      setNewTaskTitle('');
      setNewTaskCategory('other');
    } catch (err) {
      setAlertState({ type: 'error', title: 'Error', message: err.message });
    } finally {
      setAdding(false);
    }
  };

  const handleToggle = async (id, currentStatus) => {
    try {
      const updated = await dailyTasksAPI.update(id, { completed: !currentStatus });
      setTasks((prev) => prev.map((t) => (t._id === id ? updated : t)));
    } catch (err) {
      setAlertState({ type: 'error', title: 'Error', message: err.message });
    }
  };

  const handleDelete = async (id) => {
    try {
      await dailyTasksAPI.delete(id);
      setTasks((prev) => prev.filter((t) => t._id !== id));
    } catch (err) {
      setAlertState({ type: 'error', title: 'Error', message: err.message });
    }
  };

  const completedCount = tasks.filter((t) => t.completed).length;
  const totalCount = tasks.length;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (progressPercent / 100) * circumference;

  return (
    <div className="space-y-8">
      {alertState && (
        <Alert type={alertState.type} title={alertState.title} message={alertState.message} onClose={() => setAlertState(null)} />
      )}

      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/10 text-brand-500 text-xs font-semibold border border-brand-500/30 mb-2">
          <CalendarCheck className="w-3.5 h-3.5" />
          <span>Daily Health Planner</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">Today's Tasks</h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">Plan and track your daily health activities</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-4 glass-panel p-6 sm:p-8 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 flex flex-col items-center justify-center space-y-4">
          <svg width="180" height="180" viewBox="0 0 180 180">
            <circle cx="90" cy="90" r={radius} fill="none" stroke="currentColor" strokeWidth="12" className="text-slate-200 dark:text-slate-800" />
            <circle cx="90" cy="90" r={radius} fill="none" stroke="url(#progressGradient)" strokeWidth="12" strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={offset} transform="rotate(-90 90 90)" style={{ transition: 'stroke-dashoffset 0.6s ease' }} />
            <defs>
              <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#10b981" />
                <stop offset="100%" stopColor="#06b6d4" />
              </linearGradient>
            </defs>
          </svg>
          <div className="text-center">
            <p className="text-4xl font-black text-slate-900 dark:text-white">{progressPercent}%</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{completedCount} of {totalCount} tasks completed</p>
          </div>
        </div>

        <div className="lg:col-span-8 space-y-6">
          <div className="glass-panel p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800/80">
            <form onSubmit={handleAddTask} className="flex flex-col sm:flex-row gap-3">
              <input type="text" placeholder="Add a new task..." value={newTaskTitle} onChange={(e) => setNewTaskTitle(e.target.value)} className="flex-1 px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-white text-xs font-medium focus:ring-2 focus:ring-brand-500 focus:outline-none" />
              <select value={newTaskCategory} onChange={(e) => setNewTaskCategory(e.target.value)} className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-white text-xs font-medium focus:ring-2 focus:ring-brand-500 focus:outline-none">
                <option value="exercise">Exercise</option>
                <option value="water">Water</option>
                <option value="medicine">Medicine</option>
                <option value="walking">Walking</option>
                <option value="sleep">Sleep</option>
                <option value="diet">Diet</option>
                <option value="other">Other</option>
              </select>
              <button type="submit" disabled={adding || !newTaskTitle.trim()} className="px-5 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 disabled:opacity-50 text-white text-xs font-bold flex items-center justify-center gap-2 transition-all">
                {adding ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                Add Task
              </button>
            </form>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-brand-500" />
              <span className="ml-2 text-sm text-slate-500">Loading tasks...</span>
            </div>
          ) : tasks.length === 0 ? (
            <div className="glass-panel p-12 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 text-center">
              <CalendarCheck className="w-12 h-12 text-slate-400 mx-auto mb-3" />
              <p className="text-sm font-bold text-slate-900 dark:text-white">No tasks for today</p>
              <p className="text-xs text-slate-400 mt-1">Add your first health task above</p>
            </div>
          ) : (
            <div className="space-y-3">
              {tasks.map((task, idx) => {
                const config = categoryConfig[task.category] || categoryConfig.other;
                const Icon = config.icon;
                return (
                  <motion.div key={task._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }}
                    className={`glass-panel p-4 rounded-2xl border flex items-center gap-4 transition-all ${task.completed ? 'border-emerald-500/30 bg-emerald-500/5' : 'border-slate-200/80 dark:border-slate-800/80'}`}>
                    <button onClick={() => handleToggle(task._id, task.completed)} className="shrink-0">
                      {task.completed ? <CheckCircle2 className="w-5 h-5 text-emerald-400" /> : <Circle className="w-5 h-5 text-slate-400 hover:text-brand-400 transition-colors" />}
                    </button>
                    <div className={`w-8 h-8 rounded-lg ${config.bg} flex items-center justify-center`}>
                      <Icon className={`w-4 h-4 ${config.color}`} />
                    </div>
                    <span className={`flex-1 text-xs font-bold ${task.completed ? 'line-through text-slate-400' : 'text-slate-900 dark:text-white'}`}>{task.title}</span>
                    <button onClick={() => handleDelete(task._id)} className="p-1.5 rounded-lg hover:bg-rose-500/10 text-slate-400 hover:text-rose-400 transition-all">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DailyPlanner;
