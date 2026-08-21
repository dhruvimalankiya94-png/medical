import React from 'react';
import { motion } from 'framer-motion';
import { Star, Quote } from 'lucide-react';
import SectionHeader from '../common/SectionHeader';
import { TESTIMONIALS_DATA } from '../../data/landingData';

const Testimonials = () => {
  return (
    <section id="testimonials" className="py-24 md:py-32 relative bg-slate-900/40 dark:bg-slate-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <SectionHeader
          badge="User Reviews"
          title="Trusted by Top Medical Practitioners &"
          titleGradient="Healthcare Leaders"
          subtitle="Read how users rely on HealthPulse to manage their daily health tracking and wellness monitoring."
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {TESTIMONIALS_DATA.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.15 }}
              whileHover={{ y: -6 }}
              className="glass-card p-8 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 relative flex flex-col justify-between shadow-lg hover:shadow-2xl transition-all duration-300"
            >
              <Quote className="w-10 h-10 text-brand-500/20 absolute top-6 right-6 pointer-events-none" />

              <div>
                {/* 5 Star Rating */}
                <div className="flex items-center gap-1 mb-4 text-amber-400">
                  {[...Array(item.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-current" />
                  ))}
                </div>

                {/* Review text */}
                <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-normal italic">
                  "{item.review}"
                </p>
              </div>

              {/* Author Info */}
              <div className="mt-8 pt-6 border-t border-slate-200/60 dark:border-slate-800/60 flex items-center gap-4">
                <img
                  src={item.avatar}
                  alt={item.name}
                  className="w-12 h-12 rounded-full object-cover border-2 border-brand-500/40 shadow-sm"
                />
                <div>
                  <h4 className="text-base font-bold text-slate-900 dark:text-white">
                    {item.name}
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                    {item.role}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
