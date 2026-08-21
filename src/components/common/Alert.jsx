import React from 'react';
import { motion } from 'framer-motion';
import { AlertCircle, CheckCircle2, Info, AlertTriangle, X } from 'lucide-react';

const Alert = ({
  type = 'error',
  title,
  message,
  onClose,
  className = ''
}) => {
  const styles = {
    error: {
      bg: 'bg-rose-500/10 dark:bg-rose-500/15 border-rose-500/30 text-rose-600 dark:text-rose-300',
      icon: AlertCircle
    },
    success: {
      bg: 'bg-emerald-500/10 dark:bg-emerald-500/15 border-emerald-500/30 text-emerald-600 dark:text-emerald-300',
      icon: CheckCircle2
    },
    info: {
      bg: 'bg-cyan-500/10 dark:bg-cyan-500/15 border-cyan-500/30 text-cyan-600 dark:text-cyan-300',
      icon: Info
    },
    warning: {
      bg: 'bg-amber-500/10 dark:bg-amber-500/15 border-amber-500/30 text-amber-600 dark:text-amber-300',
      icon: AlertTriangle
    }
  };

  const config = styles[type] || styles.error;
  const IconComp = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className={`p-4 rounded-xl border flex items-start gap-3 text-xs sm:text-sm ${config.bg} ${className}`}
    >
      <IconComp className="w-5 h-5 shrink-0 mt-0.5" />
      <div className="flex-1">
        {title && <h5 className="font-bold mb-0.5">{title}</h5>}
        <p className="font-normal leading-relaxed">{message}</p>
      </div>
      {onClose && (
        <button
          onClick={onClose}
          className="p-1 rounded-lg hover:bg-black/10 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </motion.div>
  );
};

export default Alert;
