import React from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp, FileSpreadsheet, ShieldAlert, 
  Sparkles, CalendarCheck, BarChart3, ArrowRight 
} from 'lucide-react';
import SectionHeader from '../common/SectionHeader';
import { FEATURES_DATA } from '../../data/landingData';

const iconMap = {
  TrendingUp: TrendingUp,
  FileSpreadsheet: FileSpreadsheet,
  ShieldAlert: ShieldAlert,
  Sparkles: Sparkles,
  CalendarCheck: CalendarCheck,
  BarChart3: BarChart3
};

const Features = ({ onOpenAuth }) => {
  return (
    <section id="features" className="py-24 md:py-32 relative bg-slate-900/30 dark:bg-slate-950/60">
      {/* Background Subtle Accent */}
      <div className="absolute top-1/2 left-0 w-96 h-96 bg-brand-500/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <SectionHeader
          badge="Platform Capabilities"
          title="Cutting-Edge Architecture Built for"
          titleGradient="Modern Healthcare"
          subtitle="Explore powerful health analytics tools to track vitals, monitor wellness, and manage your personal health journey."
        />

        {/* 6 Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {FEATURES_DATA.map((feature, index) => {
            const IconComponent = iconMap[feature.icon] || TrendingUp;

            return (
              <motion.div
                key={feature.id}
                initial={{ opacity: 0, y: 25 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ y: -6 }}
                className="group relative glass-card p-8 rounded-3xl overflow-hidden flex flex-col justify-between border border-slate-200/80 dark:border-slate-800/80 shadow-md hover:shadow-2xl hover:border-brand-500/50 transition-all duration-300"
              >
                {/* Accent Background Gradient on Hover */}
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.accentColor} opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none`} />

                <div>
                  {/* Category Pill & Icon */}
                  <div className="flex items-center justify-between mb-6">
                    <div className="w-14 h-14 rounded-2xl bg-brand-500/10 dark:bg-slate-800 text-brand-500 dark:text-brand-400 flex items-center justify-center border border-brand-500/20 group-hover:scale-110 group-hover:bg-gradient-to-tr group-hover:from-brand-500 group-hover:to-cyan-400 group-hover:text-white transition-all duration-300 shadow-sm">
                      <IconComponent className="w-7 h-7" />
                    </div>
                    <span className="text-xs font-semibold px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                      {feature.category}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white group-hover:text-brand-500 dark:group-hover:text-brand-400 transition-colors duration-200">
                    {feature.title}
                  </h3>

                  {/* Description */}
                  <p className="mt-3 text-sm text-slate-600 dark:text-slate-400 leading-relaxed font-normal">
                    {feature.description}
                  </p>
                </div>

                {/* Card Action Link */}
                <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between text-xs font-bold text-brand-600 dark:text-brand-400">
                  <span className="group-hover:underline">Explore Capability</span>
                  <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Features;
