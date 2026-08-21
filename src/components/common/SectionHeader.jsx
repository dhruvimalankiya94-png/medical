import React from 'react';
import { motion } from 'framer-motion';

const SectionHeader = ({ 
  badge, 
  title, 
  titleGradient, 
  subtitle, 
  centered = true 
}) => {
  return (
    <div className={`max-w-3xl mb-16 ${centered ? 'mx-auto text-center' : 'text-left'}`}>
      {badge && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-brand-500/10 border border-brand-500/30 text-brand-600 dark:text-brand-400 mb-4"
        >
          <span className="w-2 h-2 rounded-full bg-brand-500 animate-pulse" />
          {badge}
        </motion.div>
      )}
      
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="text-3xl md:text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.15]"
      >
        {title}{' '}
        {titleGradient && (
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-brand-500 via-teal-400 to-cyan-400">
            {titleGradient}
          </span>
        )}
      </motion.h2>

      {subtitle && (
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-4 text-base md:text-lg text-slate-600 dark:text-slate-400 leading-relaxed font-normal"
        >
          {subtitle}
        </motion.p>
      )}
    </div>
  );
};

export default SectionHeader;
