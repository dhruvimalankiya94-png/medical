import React from 'react';
import { motion } from 'framer-motion';

const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  icon: Icon, 
  iconPosition = 'right', 
  className = '',
  onClick,
  type = 'button',
  disabled = false,
  ...props
}) => {
  const baseStyles = "inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 cursor-pointer";
  
  const variants = {
    primary: "bg-gradient-to-r from-brand-500 via-teal-500 to-cyan-500 hover:from-brand-600 hover:to-cyan-600 text-white shadow-lg shadow-brand-500/25 hover:shadow-brand-500/40 hover:-translate-y-0.5 border border-brand-400/30 focus:ring-brand-500",
    secondary: "bg-slate-900/80 dark:bg-slate-800/80 hover:bg-slate-800 dark:hover:bg-slate-700 text-slate-100 border border-slate-700/60 dark:border-slate-600/60 shadow-sm hover:shadow focus:ring-slate-500",
    outline: "border-2 border-brand-500/60 text-brand-600 dark:text-brand-400 hover:bg-brand-500/10 focus:ring-brand-500",
    ghost: "text-slate-700 dark:text-slate-300 hover:bg-slate-200/50 dark:hover:bg-slate-800/50 focus:ring-slate-400"
  };

  const sizes = {
    sm: "px-3.5 py-1.5 text-xs gap-1.5",
    md: "px-5 py-2.5 text-sm gap-2",
    lg: "px-7 py-3.5 text-base gap-2.5"
  };

  return (
    <motion.button
      whileTap={disabled ? undefined : { scale: 0.97 }}
      type={type}
      disabled={disabled}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      onClick={onClick}
      {...props}
    >
      {Icon && iconPosition === 'left' && <Icon className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />}
      <span>{children}</span>
      {Icon && iconPosition === 'right' && <Icon className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />}
    </motion.button>
  );
};

export default Button;
