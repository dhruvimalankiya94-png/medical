import React, { useEffect, useState, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { STATS_DATA } from '../../data/landingData';
import { Users, FileCheck2, Award, Building2 } from 'lucide-react';

const iconList = [Users, FileCheck2, Award, Building2];

const CounterCard = ({ item, index }) => {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  const Icon = iconList[index % iconList.length];

  useEffect(() => {
    if (isInView) {
      let start = 0;
      const end = item.numericValue;
      const duration = 2000; // ms
      const steps = 60;
      const stepTime = duration / steps;
      const increment = end / steps;

      const timer = setInterval(() => {
        start += increment;
        if (start >= end) {
          setCount(end);
          clearInterval(timer);
        } else {
          setCount(start);
        }
      }, stepTime);

      return () => clearInterval(timer);
    }
  }, [isInView, item.numericValue]);

  const formatDisplay = (val) => {
    if (item.numericValue >= 1000) {
      return (val / 1000).toFixed(0) + 'k';
    }
    if (item.numericValue % 1 !== 0) {
      return val.toFixed(1);
    }
    return Math.floor(val).toLocaleString();
  };

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.15 }}
      whileHover={{ y: -5 }}
      className="glass-card p-8 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 text-center relative group overflow-hidden"
    >
      <div className="absolute top-0 right-0 w-24 h-24 bg-brand-500/10 rounded-full blur-2xl group-hover:bg-brand-500/20 transition-colors pointer-events-none" />
      
      <div className="w-14 h-14 rounded-2xl bg-brand-500/10 text-brand-500 dark:text-brand-400 flex items-center justify-center mx-auto mb-4 border border-brand-500/20 group-hover:scale-110 transition-transform">
        <Icon className="w-7 h-7" />
      </div>

      <div className="text-4xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight font-mono">
        {item.prefix}{formatDisplay(count)}{item.suffix}
      </div>

      <h3 className="mt-3 text-lg font-bold text-slate-800 dark:text-slate-200">
        {item.label}
      </h3>

      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
        {item.description}
      </p>
    </motion.div>
  );
};

const Stats = () => {
  return (
    <section className="py-20 relative bg-mesh-gradient">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {STATS_DATA.map((item, index) => (
            <CounterCard key={item.id} item={item} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Stats;
