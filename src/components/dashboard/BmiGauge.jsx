import React from 'react';
import { Scale, CheckCircle2 } from 'lucide-react';

const BmiGauge = ({ bmi = 0, status = 'No Data' }) => {
  return (
    <div className="glass-panel p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 flex flex-col justify-between">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Scale className="w-5 h-5 text-teal-500" />
          <h4 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
            BMI Gauge
          </h4>
        </div>
        <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-teal-500/10 text-teal-400 border border-teal-500/20">
          {status}
        </span>
      </div>

      <div className="my-4 space-y-3">
        <div className="flex items-baseline justify-between">
          <span className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            {bmi}
          </span>
          <span className="text-xs text-slate-400 font-semibold">Healthy Category (18.5 - 24.9)</span>
        </div>

        {/* Dynamic Category Bar */}
        <div className="space-y-1">
          <div className="h-3 w-full rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden flex">
            <div className="w-1/4 h-full bg-blue-400 opacity-60" title="Underweight (<18.5)" />
            <div className="w-2/4 h-full bg-emerald-500 shadow-sm" title="Normal (18.5-24.9)" />
            <div className="w-1/4 h-full bg-amber-500 opacity-60" title="Overweight (>25)" />
          </div>
          <div className="flex justify-between text-[10px] text-slate-400 font-mono">
            <span>15</span>
            <span>18.5</span>
            <span className="text-emerald-400 font-bold">{bmi}</span>
            <span>25</span>
            <span>35</span>
          </div>
        </div>
      </div>

      <div className="pt-3 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
        <span className="flex items-center gap-1">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Ideal Body Mass
        </span>
        <span className="font-semibold text-slate-300">Target Weight</span>
      </div>
    </div>
  );
};

export default BmiGauge;
