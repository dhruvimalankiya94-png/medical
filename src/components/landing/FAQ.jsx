import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, HelpCircle } from 'lucide-react';
import SectionHeader from '../common/SectionHeader';
import { FAQ_DATA } from '../../data/landingData';

const FAQItem = ({ item, isOpen, onToggle }) => {
  return (
    <div className="glass-card rounded-2xl border border-slate-200/80 dark:border-slate-800/80 overflow-hidden transition-all duration-200">
      <button
        onClick={onToggle}
        className="w-full p-6 text-left flex items-center justify-between gap-4 font-bold text-slate-900 dark:text-white hover:text-brand-500 dark:hover:text-brand-400 transition-colors focus:outline-none"
      >
        <span className="text-base sm:text-lg flex items-center gap-3">
          <HelpCircle className="w-5 h-5 text-brand-500 shrink-0" />
          {item.question}
        </span>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.3 }}
          className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400"
        >
          <ChevronDown className="w-5 h-5" />
        </motion.div>
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
          >
            <div className="px-6 pb-6 pt-0 text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed border-t border-slate-100 dark:border-slate-800/60 mt-2">
              <p className="pt-4">{item.answer}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const FAQ = () => {
  const [openId, setOpenId] = useState(1);

  return (
    <section id="faq" className="py-24 md:py-32 relative bg-mesh-gradient">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <SectionHeader
          badge="Got Questions?"
          title="Frequently Asked"
          titleGradient="Questions"
          subtitle="Everything you need to know about the Smart Healthcare Analytics platform architecture, security, and deployment."
        />

        <div className="space-y-4">
          {FAQ_DATA.map((item) => (
            <FAQItem
              key={item.id}
              item={item}
              isOpen={openId === item.id}
              onToggle={() => setOpenId(openId === item.id ? null : item.id)}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default FAQ;
