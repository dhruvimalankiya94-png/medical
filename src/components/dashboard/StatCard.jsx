import React from 'react';
import { motion } from 'framer-motion';
import { 
  Activity, Scale, GlassWater, Moon, 
  Dumbbell, Flame, Zap, CheckCircle2, TrendingUp 
} from 'lucide-react';

const iconMap = {
  Activity,
  Scale,
  GlassWater,
  Moon,
  Dumbbell,
  Flame,
  Zap,
  CheckCircle2
};

const StatCard = ({ stat, index }) => {
  const IconComp = iconMap[stat.icon] || Activity;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      whileHover={{ y: -4 }}
      className="glass-card p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-md relative overflow-hidden flex flex-col justify-between"
    >
      <div className="flex items-start justify-between">
        <div>
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            {stat.title}
          </span>
          <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-1 tracking-tight">
            {stat.value}
          </h3>
        </div>
        <div className="w-10 h-10 rounded-xl bg-brand-500/10 text-brand-500 dark:text-brand-400 flex items-center justify-center border border-brand-500/20">
          <IconComp className="w-5 h-5" />
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between text-xs">
        <span className="text-slate-500 dark:text-slate-400 font-medium">
          {stat.subtitle}
        </span>
        <span className="flex items-center gap-1 font-bold text-emerald-500">
          <TrendingUp className="w-3 h-3" />
          {stat.change}
        </span>
      </div>
    </motion.div>
  );
};

export default StatCard;
