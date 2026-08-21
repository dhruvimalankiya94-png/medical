import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Lock, Eye, EyeOff, AlertCircle, CheckCircle2 } from 'lucide-react';

const PasswordInput = ({
  label = 'Password',
  id = 'password',
  placeholder = '••••••••',
  value,
  onChange,
  error,
  required = false,
  showStrengthMeter = false,
  className = '',
  ...props
}) => {
  const [showPassword, setShowPassword] = useState(false);

  // Evaluate password strength
  const getStrength = (pass) => {
    if (!pass) return { score: 0, label: '', color: '' };
    let score = 0;
    if (pass.length >= 8) score++;
    if (/[A-Z]/.test(pass)) score++;
    if (/[0-9]/.test(pass)) score++;
    if (/[^A-Za-z0-9]/.test(pass)) score++;

    if (score <= 1) return { score: 1, label: 'Weak', color: 'bg-rose-500', text: 'text-rose-500' };
    if (score <= 3) return { score: 2, label: 'Medium', color: 'bg-amber-500', text: 'text-amber-500' };
    return { score: 3, label: 'Strong', color: 'bg-emerald-500', text: 'text-emerald-500' };
  };

  const strength = getStrength(value);

  return (
    <div className="space-y-1.5 w-full">
      {label && (
        <label htmlFor={id} className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
          {label} {required && <span className="text-rose-500">*</span>}
        </label>
      )}

      <div className="relative rounded-xl shadow-sm">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
          <Lock className="w-4 h-4" />
        </div>

        <input
          id={id}
          type={showPassword ? 'text' : 'password'}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          className={`w-full py-2.5 pl-10 pr-10 text-sm rounded-xl bg-white/70 dark:bg-slate-900/80 border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 ${
            error
              ? 'border-rose-500/80 text-rose-900 dark:text-rose-200 focus:ring-rose-500/50 bg-rose-500/5'
              : 'border-slate-300/80 dark:border-slate-800/80 focus:border-brand-500 focus:ring-brand-500/30 dark:focus:border-brand-400'
          } ${className}`}
          {...props}
        />

        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors focus:outline-none"
        >
          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>

      {/* Password Strength Meter */}
      {showStrengthMeter && value && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="pt-1.5 space-y-1"
        >
          <div className="flex items-center justify-between text-[11px] font-semibold">
            <span className="text-slate-500 dark:text-slate-400">Password Strength:</span>
            <span className={strength.text}>{strength.label}</span>
          </div>
          <div className="grid grid-cols-3 gap-1.5 h-1.5 rounded-full overflow-hidden bg-slate-200 dark:bg-slate-800">
            <div className={`h-full transition-all duration-300 ${strength.score >= 1 ? strength.color : ''}`} />
            <div className={`h-full transition-all duration-300 ${strength.score >= 2 ? strength.color : ''}`} />
            <div className={`h-full transition-all duration-300 ${strength.score >= 3 ? strength.color : ''}`} />
          </div>
        </motion.div>
      )}

      {error && (
        <motion.p
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-xs text-rose-500 font-medium flex items-center gap-1 mt-1"
        >
          {error}
        </motion.p>
      )}
    </div>
  );
};

export default PasswordInput;
