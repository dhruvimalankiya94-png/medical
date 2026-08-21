import React from 'react';
import { motion } from 'framer-motion';

const ProgressRing = ({ 
  progress = 75, 
  size = 120, 
  strokeWidth = 10, 
  color = 'stroke-brand-500', 
  label = 'Goal',
  sublabel = '75%' 
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className="relative flex flex-col items-center justify-center">
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background Circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          className="stroke-slate-200 dark:stroke-slate-800"
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        {/* Progress Circle */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          className={`${color} transition-all duration-1000 ease-out`}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          strokeLinecap="round"
          fill="transparent"
        />
      </svg>
      {/* Centered Overlay */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <span className="text-lg font-black text-slate-900 dark:text-white leading-none">
          {sublabel}
        </span>
        <span className="text-[10px] font-semibold text-slate-400 mt-0.5">
          {label}
        </span>
      </div>
    </div>
  );
};

export default ProgressRing;
