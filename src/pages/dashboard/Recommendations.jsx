import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Loader2, Droplets, Moon, Dumbbell, Apple, Heart, Salad } from 'lucide-react';
import { reportsAPI, healthProfileAPI } from '../../services/api';
import Alert from '../../components/common/Alert';

const Recommendations = () => {
  const [latestVitals, setLatestVitals] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [alertState, setAlertState] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [vitals, hp] = await Promise.all([
        reportsAPI.getVitalsHistory(1).catch(() => []),
        healthProfileAPI.get().catch(() => null),
      ]);
      setLatestVitals(Array.isArray(vitals) && vitals.length > 0 ? vitals[vitals.length - 1] : null);
      setProfile(hp);
    } catch (err) {
      // silent
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center py-24"><Loader2 className="w-6 h-6 animate-spin text-brand-500" /></div>;
  }

  const recs = { diet: [], exercise: [], sleep: [], water: [], lifestyle: [] };

  if (latestVitals) {
    if (latestVitals.waterIntake < 2.5) {
      recs.water.push({ title: 'Increase Water Intake', desc: `You had ${latestVitals.waterIntake}L. Aim for ${profile?.dailyWaterGoal || 3}L daily. Try keeping a water bottle at your desk.`, priority: 'high' });
    } else {
      recs.water.push({ title: 'Good Hydration', desc: `You had ${latestVitals.waterIntake}L water. Keep it up!`, priority: 'low' });
    }

    if (latestVitals.sleepHours < 7) {
      recs.sleep.push({ title: 'Improve Sleep Duration', desc: `You slept ${latestVitals.sleepHours} hours. Aim for 7-9 hours. Avoid screens 1 hour before bed.`, priority: 'high' });
    } else if (latestVitals.sleepHours > 9) {
      recs.sleep.push({ title: 'Monitor Sleep Duration', desc: `You slept ${latestVitals.sleepHours} hours. Oversleeping can also affect health.`, priority: 'medium' });
    } else {
      recs.sleep.push({ title: 'Good Sleep Pattern', desc: `${latestVitals.sleepHours} hours of sleep is within the healthy range.`, priority: 'low' });
    }

    if (latestVitals.exerciseMinutes < 30) {
      recs.exercise.push({ title: 'Increase Physical Activity', desc: `You exercised ${latestVitals.exerciseMinutes} minutes. Aim for 30+ minutes daily. Try a brisk walk or Suryanamaskar.`, priority: 'high' });
    } else {
      recs.exercise.push({ title: 'Great Activity Level', desc: `${latestVitals.exerciseMinutes} minutes of exercise today. Keep moving!`, priority: 'low' });
    }

    if (latestVitals.sugar > 126) {
      recs.diet.push({ title: 'Monitor Blood Sugar', desc: `Fasting sugar at ${latestVitals.sugar} mg/dL is elevated. Reduce refined carbs and sugar. Consult your doctor.`, priority: 'high' });
    } else if (latestVitals.sugar > 100) {
      recs.diet.push({ title: 'Watch Sugar Intake', desc: `Sugar at ${latestVitals.sugar} mg/dL is borderline. Choose complex carbs over simple sugars.`, priority: 'medium' });
    } else {
      recs.diet.push({ title: 'Normal Sugar Level', desc: `${latestVitals.sugar} mg/dL is within healthy range. Maintain your current diet.`, priority: 'low' });
    }

    if (latestVitals.bpSystolic > 130) {
      recs.diet.push({ title: 'Reduce Sodium Intake', desc: `BP at ${latestVitals.bpSystolic}/${latestVitals.bpDiastolic} mmHg is elevated. Limit salt, eat more fruits and vegetables.`, priority: 'high' });
    }

    if (latestVitals.bmi > 25) {
      recs.lifestyle.push({ title: 'Weight Management', desc: `BMI at ${latestVitals.bmi} is above normal. Combine diet control with regular exercise.`, priority: 'medium' });
    } else if (latestVitals.bmi >= 18.5 && latestVitals.bmi <= 24.9) {
      recs.lifestyle.push({ title: 'Healthy BMI', desc: `BMI at ${latestVitals.bmi} is in the healthy range.`, priority: 'low' });
    }
  }

  recs.lifestyle.push(
    { title: 'Daily Health Logging', desc: 'Log your health data daily for better tracking and personalized recommendations.', priority: 'low' },
    { title: 'Stay Consistent', desc: 'Maintain your daily tasks and health routine for best results. Small steps lead to big changes.', priority: 'low' }
  );

  const priorityColors = { high: 'border-rose-500/30 bg-rose-500/5', medium: 'border-amber-500/30 bg-amber-500/5', low: 'border-emerald-500/30 bg-emerald-500/5' };
  const priorityBadge = { high: 'bg-rose-500/20 text-rose-400', medium: 'bg-amber-500/20 text-amber-400', low: 'bg-emerald-500/20 text-emerald-400' };

  const sections = [
    { title: 'Diet Recommendations', icon: Apple, items: recs.diet, color: 'text-emerald-400' },
    { title: 'Exercise Suggestions', icon: Dumbbell, items: recs.exercise, color: 'text-cyan-400' },
    { title: 'Sleep Advice', icon: Moon, items: recs.sleep, color: 'text-indigo-400' },
    { title: 'Hydration Goals', icon: Droplets, items: recs.water, color: 'text-blue-400' },
    { title: 'Lifestyle Tips', icon: Heart, items: recs.lifestyle, color: 'text-rose-400' },
  ];

  return (
    <div className="space-y-8">
      {alertState && <Alert type={alertState.type} title={alertState.title} message={alertState.message} onClose={() => setAlertState(null)} />}

      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/10 text-brand-500 text-xs font-semibold border border-brand-500/30 mb-2">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Personalized Recommendations</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">Health Recommendations</h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
          {latestVitals ? 'Based on your latest health data' : 'Add health records to get personalized recommendations'}
        </p>
      </div>

      {!latestVitals ? (
        <div className="glass-panel p-12 rounded-3xl border text-center">
          <Sparkles className="w-12 h-12 text-slate-400 mx-auto mb-3" />
          <p className="text-sm font-bold text-slate-900 dark:text-white">No data available yet</p>
          <p className="text-xs text-slate-400 mt-1">Add your first health record to get personalized recommendations</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {sections.map((section, idx) => {
            const Icon = section.icon;
            return (
              <motion.div key={section.title} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1 }}
                className="glass-panel p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 space-y-4">
                <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
                  <Icon className={`w-5 h-5 ${section.color}`} />
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">{section.title}</h3>
                </div>
                {section.items.length === 0 ? (
                  <p className="text-xs text-slate-400 py-2">No specific recommendations</p>
                ) : (
                  <div className="space-y-3">
                    {section.items.map((item, i) => (
                      <div key={i} className={`p-3 rounded-xl border ${priorityColors[item.priority]}`}>
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-xs font-bold text-slate-900 dark:text-white">{item.title}</p>
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${priorityBadge[item.priority]}`}>
                            {item.priority.toUpperCase()}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">{item.desc}</p>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      )}

      <div className="glass-panel p-4 rounded-2xl border border-amber-500/30 bg-amber-500/5">
        <p className="text-[11px] text-amber-600 dark:text-amber-400 font-semibold">
          Disclaimer: These recommendations are for general wellness purposes only. They are not medical advice. Always consult a healthcare professional for medical guidance.
        </p>
      </div>
    </div>
  );
};

export default Recommendations;
