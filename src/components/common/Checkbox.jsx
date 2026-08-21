import React from 'react';
import { Check } from 'lucide-react';

const Checkbox = ({
  id,
  label,
  checked,
  onChange,
  disabled = false,
  required = false,
  className = ''
}) => {
  return (
    <label htmlFor={id} className={`inline-flex items-center gap-2.5 cursor-pointer select-none ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}>
      <div className="relative">
        <input
          id={id}
          type="checkbox"
          checked={checked}
          onChange={onChange}
          disabled={disabled}
          required={required}
          className="sr-only peer"
        />
        <div className="w-4 h-4 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 peer-checked:bg-brand-500 peer-checked:border-brand-500 transition-all flex items-center justify-center peer-focus:ring-2 peer-focus:ring-brand-500/30">
          <Check className={`w-3 h-3 text-white transition-transform ${checked ? 'scale-100' : 'scale-0'}`} />
        </div>
      </div>
      {label && (
        <span className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 font-medium">
          {label}
        </span>
      )}
    </label>
  );
};

export default Checkbox;
