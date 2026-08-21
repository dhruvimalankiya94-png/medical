import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, ShieldCheck, Smartphone, HeartHandshake, Cpu, CheckCircle2, ArrowUpRight } from 'lucide-react';
import SectionHeader from '../common/SectionHeader';
import { WHY_CHOOSE_US } from '../../data/landingData';

const iconMap = {
  Zap: Zap,
  ShieldCheck: ShieldCheck,
  Smartphone: Smartphone,
  HeartHandshake: HeartHandshake,
  Cpu: Cpu
};

const WhyUs = () => {
  const [activeTab, setActiveTab] = useState('fast');

  const activeData = WHY_CHOOSE_US.find(item => item.id === activeTab) || WHY_CHOOSE_US[0];

  const progressMetrics = [
    { name: 'Cardiovascular Stability Index', value: 94, color: 'bg-emerald-500' },
    { name: 'Sleep Restoration & Recovery Score', value: 88, color: 'bg-teal-500' },
    { name: 'Metabolic Glucose Balance Ratio', value: 96, color: 'bg-cyan-500' },
    { name: 'Systemic Health Readiness', value: 91, color: 'bg-brand-400' }
  ];

  return (
    <section id="why-us" className="py-24 md:py-32 relative overflow-hidden bg-slate-950/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <SectionHeader
          badge="Enterprise Grade Performance"
          title="Why Leading Medical Teams Choose"
          titleGradient="HealthPulse"
          subtitle="Built for personal health management with an intuitive interface that makes tracking your wellness simple and effective."
        />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          
          {/* Left Column: Reasons Selection List */}
          <div className="lg:col-span-5 space-y-3">
            {WHY_CHOOSE_US.map((item) => {
              const IconComp = iconMap[item.icon] || Zap;
              const isActive = activeTab === item.id;

              return (
                <motion.div
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  whileHover={{ x: 4 }}
                  className={`p-5 rounded-2xl cursor-pointer transition-all duration-300 border ${
                    isActive
                      ? 'bg-slate-900/90 border-brand-500/60 shadow-lg shadow-brand-500/10'
                      : 'bg-slate-900/30 border-slate-800/60 hover:bg-slate-900/60'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-xl ${
                      isActive 
                        ? 'bg-brand-500 text-white shadow-glow-emerald' 
                        : 'bg-slate-800 text-slate-400'
                    } transition-colors`}>
                      <IconComp className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className={`font-bold text-base ${isActive ? 'text-white' : 'text-slate-300'}`}>
                          {item.title}
                        </h4>
                        <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-brand-500/10 text-brand-400 border border-brand-500/20">
                          {item.metric}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                        {item.subtitle}
                      </p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Right Column: Interactive Dashboard Progress Preview */}
          <div className="lg:col-span-7">
            <div className="glass-panel p-8 rounded-3xl border border-slate-800 shadow-2xl relative overflow-hidden">
              <div className="flex items-center justify-between pb-6 border-b border-slate-800">
                <div>
                  <span className="text-xs font-semibold uppercase tracking-wider text-brand-400">
                    Live Health Monitor
                  </span>
                  <h3 className="text-2xl font-bold text-white mt-1">
                    {activeData.title}
                  </h3>
                </div>
                <div className="p-2 rounded-xl bg-slate-800 text-slate-400 border border-slate-700">
                  <ArrowUpRight className="w-5 h-5" />
                </div>
              </div>

              {/* Dynamic Description Box */}
              <div className="py-6 border-b border-slate-800">
                <p className="text-sm text-slate-300 leading-relaxed">
                  {activeData.description}
                </p>
              </div>

              {/* Live Metric Progress Bars */}
              <div className="pt-6 space-y-5">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                  Active Health Indicators
                </h4>

                {progressMetrics.map((metric, idx) => (
                  <div key={idx} className="space-y-2">
                    <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
                      <span className="flex items-center gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-brand-400" />
                        {metric.name}
                      </span>
                      <span className="font-mono text-brand-400 font-bold">{metric.value}%</span>
                    </div>

                    <div className="w-full h-3 rounded-full bg-slate-900 border border-slate-800 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${metric.value}%` }}
                        transition={{ duration: 0.8, delay: idx * 0.1 }}
                        className={`h-full ${metric.color} shadow-sm rounded-full`}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default WhyUs;
