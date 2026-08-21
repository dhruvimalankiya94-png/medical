import React from 'react';
import { motion } from 'framer-motion';
import { FcGoogle } from 'react-icons/fc';
import { FaGithub } from 'react-icons/fa';

const SocialButton = ({ provider = 'google', onClick, disabled = false }) => {
  const providers = {
    google: {
      name: 'Continue with Google',
      icon: FcGoogle,
      border: 'border-slate-300/80 dark:border-slate-800'
    },
    github: {
      name: 'Continue with GitHub',
      icon: FaGithub,
      border: 'border-slate-300/80 dark:border-slate-800 text-slate-900 dark:text-white'
    }
  };

  const config = providers[provider] || providers.google;
  const IconComp = config.icon;

  return (
    <motion.button
      whileTap={{ scale: 0.98 }}
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`w-full py-2.5 px-4 rounded-xl bg-white/80 dark:bg-slate-900/90 border ${config.border} hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs sm:text-sm font-semibold flex items-center justify-center gap-3 shadow-sm hover:shadow transition-all duration-200 cursor-pointer disabled:opacity-50`}
    >
      <IconComp className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
      <span>{config.name}</span>
    </motion.button>
  );
};

export default SocialButton;
