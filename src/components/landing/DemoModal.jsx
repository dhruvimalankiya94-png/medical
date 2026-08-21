import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Play, Shield, Sparkles, Activity, CheckCircle2 } from 'lucide-react';
import Button from '../common/Button';

const DemoModal = ({ isOpen, onClose, type = 'demo' }) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-10 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-md"
        />

        {/* Modal Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative w-full max-w-3xl glass-panel rounded-3xl overflow-hidden shadow-2xl z-10 border border-slate-700/80"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-slate-800 bg-slate-900/40">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-brand-500/20 border border-brand-500/30 flex items-center justify-center text-brand-400">
                {type === 'demo' ? <Play className="w-5 h-5 fill-current" /> : <Sparkles className="w-5 h-5" />}
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">
                  {type === 'demo' ? 'Interactive Product Tour' : 'Smart Healthcare Portal Access'}
                </h3>
                <p className="text-xs text-slate-400">HealthPulse - Personal Health Analytics Platform</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="p-6 md:p-8 space-y-6">
            {type === 'demo' ? (
              <div className="space-y-6">
                <div className="relative aspect-video rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden group flex items-center justify-center">
                  <div className="absolute inset-0 bg-mesh-gradient opacity-60" />
                  <div className="relative z-10 text-center space-y-4 p-6">
                    <div className="w-16 h-16 rounded-full bg-brand-500/30 border-2 border-brand-400 flex items-center justify-center mx-auto text-brand-300 shadow-glow-emerald animate-pulse">
                      <Activity className="w-8 h-8" />
                    </div>
                    <div>
                      <span className="px-3 py-1 rounded-full text-xs font-medium bg-brand-500/20 text-brand-300 border border-brand-500/40">
                        Interactive Simulation Running
                      </span>
                      <h4 className="text-2xl font-bold text-white mt-2">
                        Real-Time Biometric Stream Simulator
                      </h4>
                      <p className="text-sm text-slate-300 max-w-md mx-auto mt-1">
                        Watching continuous ECG rhythm, predictive AI cardiovascular scoring, and automated emergency alert dispatches.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
                    <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 mb-1">
                      <CheckCircle2 className="w-4 h-4" /> Live Predictive Scoring
                    </div>
                    <p className="text-xs text-slate-400">Accurate health tracking with reliable data insights.</p>
                  </div>
                  <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
                    <div className="flex items-center gap-2 text-xs font-semibold text-teal-400 mb-1">
                      <CheckCircle2 className="w-4 h-4" /> Zero-Delay Alerting
                    </div>
                    <p className="text-xs text-slate-400">Fast and responsive health data processing.</p>
                  </div>
                  <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
                    <div className="flex items-center gap-2 text-xs font-semibold text-cyan-400 mb-1">
                      <CheckCircle2 className="w-4 h-4" /> HIPAA Vault Compliant
                    </div>
                    <p className="text-xs text-slate-400">End-to-end multi-layer encrypted patient records storage.</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-6 space-y-4">
                <div className="w-16 h-16 rounded-full bg-brand-500/20 text-brand-400 flex items-center justify-center mx-auto border border-brand-500/40">
                  <Shield className="w-8 h-8" />
                </div>
                <h4 className="text-2xl font-bold text-white">Frontend Preview Mode</h4>
                <p className="text-slate-300 max-w-md mx-auto text-sm">
                  You are currently viewing **Part 1 (Landing Website)**. Authentication workflows, Doctor & Patient Dashboards, and REST APIs will be enabled in subsequent project modules.
                </p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 p-6 border-t border-slate-800 bg-slate-900/40">
            <Button variant="secondary" onClick={onClose}>
              Close Preview
            </Button>
            <Button variant="primary" onClick={onClose}>
              Got It
            </Button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default DemoModal;
