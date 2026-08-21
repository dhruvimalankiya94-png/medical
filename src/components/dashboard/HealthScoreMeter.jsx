import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Activity } from 'lucide-react';

const HealthScoreMeter = ({ score = 98 }) => {
  return (
    <div className="glass-panel p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 flex flex-col justify-between relative overflow-hidden">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-brand-500" />
          <h4 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
            Health Score Meter
          </h4>
        </div>
        <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
          Optimal
        </span>
      </div>

      <div className="my-6 text-center">
        <div className="relative inline-flex items-center justify-center">
          <div className="w-36 h-36 rounded-full border-8 border-slate-200 dark:border-slate-800 border-t-brand-500 border-r-teal-400 border-b-cyan-400 flex items-center justify-center shadow-glow-emerald">
            <div className="text-center">
              <span className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">
                {score}
              </span>
              <span className="text-xs text-slate-400 font-bold block">/ 100</span>
            </div>
          </div>
        </div>
      </div>

      <div className="pt-3 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
        <span className="flex items-center gap-1 font-medium">
          <ShieldCheck className="w-4 h-4 text-emerald-400" /> Verified Data
        </span>
        <span className="font-semibold text-emerald-400">{score >= 90 ? 'Optimal Score' : 'Needs Improvement'}</span>
      </div>
    </div>
  );
};

export default HealthScoreMeter;
