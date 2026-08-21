import React from 'react';
import { motion } from 'framer-motion';
import { 
  Play, ArrowRight, Activity, HeartPulse, 
  Scale, Droplets, GlassWater, ShieldCheck, Sparkles, TrendingUp, Zap 
} from 'lucide-react';
import { Link } from 'react-router-dom';
import Button from '../common/Button';
import { HERO_HEALTH_VITALS } from '../../data/landingData';

const Hero = ({ onOpenDemo, onOpenAuth }) => {
  return (
    <section className="relative min-h-screen pt-28 pb-20 md:pt-36 md:pb-28 flex items-center overflow-hidden bg-mesh-gradient">
      {/* Background Glow Blobs */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-brand-500/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-1/3 right-10 w-[400px] h-[400px] bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Left Column: Heading & CTAs */}
          <div className="lg:col-span-6 space-y-8 text-center lg:text-left">
            {/* Top Pill Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-brand-500/10 border border-brand-500/30 text-brand-600 dark:text-brand-300 text-xs sm:text-sm font-semibold shadow-sm"
            >
              <span className="flex h-2 w-2 rounded-full bg-brand-400 animate-ping" />
              <Sparkles className="w-4 h-4 text-brand-400" />
              <span>Next-Gen Healthcare Intelligence Platform</span>
            </motion.div>

            {/* Main Title */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 dark:text-white tracking-tight leading-[1.1]"
            >
              Transform Patient Care with{' '}
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-brand-500 via-teal-400 to-cyan-400">
                Real-Time Smart Analytics
              </span>
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-lg sm:text-xl text-slate-600 dark:text-slate-300 font-normal leading-relaxed max-w-2xl mx-auto lg:mx-0"
            >
              Track your daily health vitals, monitor wellness trends, and get personalized health insights in one place.
            </motion.p>

            {/* CTA Action Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2"
            >
              <Link to="/register" className="w-full sm:w-auto">
                <Button
                  variant="primary"
                  size="lg"
                  icon={ArrowRight}
                  className="w-full sm:w-auto"
                >
                  Get Started Free
                </Button>
              </Link>
              
              <Button
                variant="secondary"
                size="lg"
                icon={Play}
                iconPosition="left"
                onClick={onOpenDemo}
                className="w-full sm:w-auto"
              >
                Watch Demo
              </Button>
            </motion.div>

            {/* Micro Trust Badges */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="pt-6 border-t border-slate-200/60 dark:border-slate-800/80 flex flex-wrap items-center justify-center lg:justify-start gap-6 text-xs text-slate-500 dark:text-slate-400 font-medium"
            >
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>HIPAA Compliant</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-cyan-400" />
                <span>Sub-15ms Latency</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Activity className="w-4 h-4 text-brand-400" />
                <span>24/7 Health Tracking</span>
              </div>
            </motion.div>
          </div>

          {/* Right Column: Interactive Dashboard Preview & Floating Health Cards */}
          <div className="lg:col-span-6 relative mt-6 lg:mt-0">
            {/* Dashboard Container Mockup */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="relative glass-panel rounded-3xl p-6 sm:p-7 shadow-2xl border border-slate-200/80 dark:border-slate-800/80 overflow-hidden"
            >
              {/* Top Window Bar */}
              <div className="flex items-center justify-between border-b border-slate-200/60 dark:border-slate-800 pb-4 mb-6">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-rose-500/80" />
                  <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                  <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                  <span className="text-xs font-mono text-slate-400 dark:text-slate-500 ml-2">
                    pulse-analytics-v2.4.live
                  </span>
                </div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 text-xs font-semibold border border-emerald-500/30">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  Live Syncing
                </div>
              </div>

              {/* Main Simulated Heart Rate & Biometric Chart */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                      Cardiovascular Stability Index
                    </h3>
                    <p className="text-2xl font-black text-slate-900 dark:text-white mt-0.5">
                      78 <span className="text-xs font-medium text-slate-400">BPM (Normal)</span>
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-md border border-emerald-500/20">
                      +2.4% Optimal
                    </span>
                  </div>
                </div>

                {/* Animated Continuous ECG SVG Waveform */}
                <div className="h-28 w-full bg-slate-900/80 rounded-2xl p-3 border border-slate-800/80 relative flex items-center overflow-hidden shadow-inner">
                  <svg className="w-full h-full text-brand-400" viewBox="0 0 500 100" preserveAspectRatio="none">
                    <motion.path
                      d="M0,50 L80,50 L90,20 L105,80 L120,30 L135,60 L145,50 L250,50 L260,15 L275,85 L290,25 L305,65 L315,50 L500,50"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      initial={{ pathLength: 0, opacity: 0.3 }}
                      animate={{ pathLength: [0, 1, 1], opacity: [0.4, 1, 0.4] }}
                      transition={{ repeat: Infinity, duration: 2.2, ease: "easeInOut" }}
                      className="drop-shadow-[0_0_12px_rgba(16,185,129,0.9)]"
                    />
                  </svg>
                  {/* Moving Scanning Light Beam from Left to Right */}
                  <motion.div
                    animate={{ left: ['-10%', '110%'] }}
                    transition={{ repeat: Infinity, duration: 2.2, ease: 'linear' }}
                    className="absolute top-0 bottom-0 w-8 bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-75 shadow-glow-cyan pointer-events-none"
                  />
                </div>
              </div>

              {/* Grid of Key Metrics inside Dashboard */}
              <div className="grid grid-cols-2 gap-3 mt-4">
                <div className="p-3.5 rounded-xl bg-slate-100/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800">
                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
                    <Activity className="w-3.5 h-3.5 text-brand-400" />
                    <span>AI Risk Level</span>
                  </div>
                  <p className="text-sm font-bold text-slate-900 dark:text-white mt-1">
                    0.02% (Minimal Risk)
                  </p>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-100/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800">
                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
                    <TrendingUp className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Metabolic Rate</span>
                  </div>
                  <p className="text-sm font-bold text-slate-900 dark:text-white mt-1">
                    1,850 kcal/day
                  </p>
                </div>
              </div>
            </motion.div>

            {/* FLOATING HEALTH CARDS OVERLAY WITH INTERACTIVE MOUSEOVER & CLICK ANIMATIONS */}
            
            {/* 1. Health Score Floating Card (Top Left) */}
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ repeat: Infinity, duration: 5, ease: 'easeInOut' }}
              whileHover={{ scale: 1.08, y: -14 }}
              whileTap={{ scale: 0.95 }}
              onClick={onOpenDemo}
              className="absolute -top-6 -left-6 sm:-left-8 glass-card p-3.5 rounded-2xl shadow-xl border border-emerald-500/40 z-20 flex items-center gap-3 bg-slate-950/90 cursor-pointer group hover:border-emerald-400 hover:shadow-glow-emerald"
            >
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30 group-hover:scale-110 transition-transform">
                <Activity className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[11px] font-semibold text-slate-400">Health Score</p>
                <div className="flex items-center gap-1.5">
                  <span className="text-lg font-extrabold text-white">98/100</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold">Optimal</span>
                </div>
              </div>
            </motion.div>

            {/* 2. BMI Floating Card (Top Right) */}
            <motion.div
              animate={{ y: [0, 10, 0] }}
              transition={{ repeat: Infinity, duration: 6, ease: 'easeInOut', delay: 0.5 }}
              whileHover={{ scale: 1.08, y: 6 }}
              whileTap={{ scale: 0.95 }}
              onClick={onOpenDemo}
              className="absolute -top-6 -right-6 sm:-right-8 glass-card p-3.5 rounded-2xl shadow-xl border border-teal-500/40 z-20 flex items-center gap-3 bg-slate-950/90 cursor-pointer group hover:border-teal-400 hover:shadow-glow-cyan"
            >
              <div className="w-10 h-10 rounded-xl bg-teal-500/20 text-teal-400 flex items-center justify-center border border-teal-500/30 group-hover:scale-110 transition-transform">
                <Scale className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[11px] font-semibold text-slate-400">BMI Index</p>
                <div className="flex items-center gap-1.5">
                  <span className="text-lg font-extrabold text-white">22.4</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-teal-500/20 text-teal-400 font-bold">Normal</span>
                </div>
              </div>
            </motion.div>

            {/* 3. Blood Pressure Floating Card (Bottom Left) */}
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ repeat: Infinity, duration: 5.5, ease: 'easeInOut', delay: 1 }}
              whileHover={{ scale: 1.08, y: -12 }}
              whileTap={{ scale: 0.95 }}
              onClick={onOpenDemo}
              className="absolute -bottom-6 -left-6 sm:-left-8 glass-card p-3.5 rounded-2xl shadow-xl border border-cyan-500/40 z-20 flex items-center gap-3 bg-slate-950/90 cursor-pointer group hover:border-cyan-400 hover:shadow-glow-cyan"
            >
              <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center border border-cyan-500/30 group-hover:scale-110 transition-transform">
                <HeartPulse className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[11px] font-semibold text-slate-400">Blood Pressure</p>
                <div className="flex items-center gap-1.5">
                  <span className="text-lg font-extrabold text-white">120/80</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-400 font-bold">mmHg</span>
                </div>
              </div>
            </motion.div>

            {/* 4. Sugar Level Floating Card (Bottom Right) */}
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ repeat: Infinity, duration: 4.8, ease: 'easeInOut', delay: 1.5 }}
              whileHover={{ scale: 1.08, y: 4 }}
              whileTap={{ scale: 0.95 }}
              onClick={onOpenDemo}
              className="absolute -bottom-6 -right-6 sm:-right-8 glass-card p-3.5 rounded-2xl shadow-xl border border-blue-500/40 z-20 flex items-center gap-3 bg-slate-950/90 cursor-pointer group hover:border-blue-400 hover:shadow-glow-emerald"
            >
              <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center border border-blue-500/30 group-hover:scale-110 transition-transform">
                <Droplets className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[11px] font-semibold text-slate-400">Sugar Level</p>
                <div className="flex items-center gap-1.5">
                  <span className="text-lg font-extrabold text-white">95 mg/dL</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold">Normal</span>
                </div>
              </div>
            </motion.div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default Hero;
