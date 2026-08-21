import React from 'react';
import { motion } from 'framer-motion';
import { Activity, ShieldCheck, Sun, Moon, ArrowLeft, HeartPulse, CheckCircle2 } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { Link } from 'react-router-dom';

const AuthLayout = ({ children, title, subtitle, backLink = '/' }) => {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#080d1a] flex flex-col justify-between selection:bg-brand-500 selection:text-white transition-colors duration-300">
      
      {/* Top Header Bar */}
      <header className="py-4 px-6 sm:px-10 flex items-center justify-between border-b border-slate-200/60 dark:border-slate-800/60 bg-white/40 dark:bg-slate-950/40 backdrop-blur-md sticky top-0 z-30">
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 via-teal-500 to-cyan-400 p-0.5 shadow-glow-emerald group-hover:scale-105 transition-transform">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <Activity className="w-4 h-4 text-brand-400 animate-pulse" />
            </div>
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-black tracking-tight text-slate-900 dark:text-white">
              Pulse<span className="text-brand-500">AI</span>
            </span>
            <span className="text-[9px] font-semibold text-slate-400 uppercase tracking-widest">
              Healthcare Analytics
            </span>
          </div>
        </Link>

        <div className="flex items-center gap-3">
          <Link
            to={backLink}
            className="hidden sm:flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-brand-500 transition-colors px-3 py-1.5 rounded-lg hover:bg-slate-200/50 dark:hover:bg-slate-800/50"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Website
          </Link>

          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl bg-slate-200/60 dark:bg-slate-900/80 text-slate-700 dark:text-slate-300 hover:text-brand-500 border border-slate-300/50 dark:border-slate-800 transition-colors"
            aria-label="Toggle dark mode"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>
      </header>

      {/* Main Split Grid */}
      <div className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        
        {/* Left Column: Healthcare Illustration & Highlights */}
        <div className="hidden lg:flex lg:col-span-6 flex-col justify-center space-y-8 p-8 relative">
          {/* Glowing Ambient Blobs */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-brand-500/10 rounded-full blur-[120px] pointer-events-none" />

          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-6"
          >
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-500/10 border border-brand-500/30 text-brand-500 text-xs font-semibold">
              <ShieldCheck className="w-4 h-4" />
              <span>HIPAA & Enterprise Security Certified</span>
            </div>

            <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
              Intelligent Healthcare Analytics at your{' '}
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-brand-500 via-teal-400 to-cyan-400">
                Fingertips
              </span>
            </h1>

            <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">
              Track your daily health vitals, monitor wellness trends, and manage personal health records in one place.
            </p>

            {/* Feature Check List */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-3 text-xs font-semibold text-slate-700 dark:text-slate-200">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>Sub-15ms Real-Time Biometric Stream Syncing</span>
              </div>
              <div className="flex items-center gap-3 text-xs font-semibold text-slate-700 dark:text-slate-200">
                <CheckCircle2 className="w-4 h-4 text-teal-500" />
                <span>End-to-End 256-Bit Encrypted Data Vault</span>
              </div>
              <div className="flex items-center gap-3 text-xs font-semibold text-slate-700 dark:text-slate-200">
                <CheckCircle2 className="w-4 h-4 text-cyan-500" />
                <span>Personal Health Dashboard</span>
              </div>
            </div>

            {/* Testimonial Snippet Box */}
            <div className="glass-card p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 mt-6 shadow-md">
              <div className="flex items-center gap-3">
                <img
                  src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=200"
                  alt="Dr. Priya Sharma"
                  className="w-10 h-10 rounded-full object-cover border border-brand-500"
                />
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">Dr. Priya Sharma</h4>
                  <p className="text-[11px] text-slate-400">Chief Cardiologist, AIIMS New Delhi</p>
                </div>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-2.5 italic">
                "HealthPulse has simplified our daily health tracking workflow by over 60%. The interface is smooth, reliable, and perfectly suited for personal health management."
              </p>
            </div>
          </motion.div>
        </div>

        {/* Right Column: Auth Form Box */}
        <div className="lg:col-span-6 w-full max-w-md mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 shadow-2xl relative"
          >
            {/* Header titles */}
            <div className="text-center mb-6 space-y-1">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                {title}
              </h2>
              {subtitle && (
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                  {subtitle}
                </p>
              )}
            </div>

            {children}
          </motion.div>
        </div>

      </div>

      {/* Footer minimal credit */}
      <footer className="py-4 text-center text-[11px] text-slate-400">
        © {new Date().getFullYear()} HealthPulse Systems. Final Year Computer Engineering Project.
      </footer>
    </div>
  );
};

export default AuthLayout;
