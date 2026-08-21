import React from 'react';
import { motion } from 'framer-motion';
import { AlertCircle, CheckCircle2 } from 'lucide-react';

const Input = ({
  label,
  id,
  type = 'text',
  placeholder,
  value,
  onChange,
  error,
  success,
  icon: Icon,
  required = false,
  disabled = false,
  className = '',
  helperText,
  ...props
}) => {
  return (
    <div className="space-y-1.5 w-full">
      {label && (
        <label htmlFor={id} className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
          {label} {required && <span className="text-rose-500">*</span>}
        </label>
      )}

      <div className="relative rounded-xl shadow-sm">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
            <Icon className="w-4 h-4" />
          </div>
        )}

        <input
          id={id}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          className={`w-full py-2.5 text-sm rounded-xl bg-white/70 dark:bg-slate-900/80 border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 ${
            Icon ? 'pl-10' : 'pl-3.5'
          } ${
            error
              ? 'border-rose-500/80 text-rose-900 dark:text-rose-200 focus:ring-rose-500/50 bg-rose-500/5'
              : success
              ? 'border-emerald-500/80 focus:ring-emerald-500/50'
              : 'border-slate-300/80 dark:border-slate-800/80 focus:border-brand-500 focus:ring-brand-500/30 dark:focus:border-brand-400'
          } ${disabled ? 'opacity-60 cursor-not-allowed bg-slate-100 dark:bg-slate-800' : ''} ${className}`}
          {...props}
        />

        {error && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-rose-500">
            <AlertCircle className="w-4 h-4" />
          </div>
        )}

        {!error && success && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-emerald-500">
            <CheckCircle2 className="w-4 h-4" />
          </div>
        )}
      </div>

      {error && (
        <motion.p
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-xs text-rose-500 font-medium flex items-center gap-1 mt-1"
        >
          {error}
        </motion.p>
      )}

      {!error && helperText && (
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          {helperText}
        </p>
      )}
    </div>
  );
};

export default Input;
