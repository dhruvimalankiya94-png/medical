import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles, ShieldCheck, Activity } from 'lucide-react';
import { Link } from 'react-router-dom';
import Button from '../common/Button';

const CTA = ({ onOpenAuth }) => {
  return (
    <section id="cta" className="py-20 md:py-28 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative rounded-3xl overflow-hidden p-8 sm:p-12 md:p-16 text-center bg-gradient-to-r from-slate-900 via-slate-950 to-slate-900 border border-slate-800 shadow-2xl"
        >
          {/* Ambient Glowing Orbs inside CTA */}
          <div className="absolute -top-24 -left-24 w-72 h-72 bg-brand-500/20 rounded-full blur-[100px] pointer-events-none" />
          <div className="absolute -bottom-24 -right-24 w-72 h-72 bg-cyan-500/20 rounded-full blur-[100px] pointer-events-none" />

          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-brand-500/10 border border-brand-500/30 text-brand-400 mb-6">
            <Sparkles className="w-4 h-4" />
            <span>Ready to Modernize Your Healthcare Workflow?</span>
          </div>

          {/* Heading */}
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight leading-tight max-w-3xl mx-auto">
            Experience Next-Gen Medical Analytics with{' '}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-brand-400 via-teal-300 to-cyan-400">
              HealthPulse Today
            </span>
          </h2>

          {/* Subtitle */}
          <p className="mt-4 text-base sm:text-lg text-slate-300 max-w-2xl mx-auto font-normal">
            Join thousands of users managing their health with real-time tracking and personalized insights.
          </p>

          {/* CTA Action Buttons */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/register" className="w-full sm:w-auto">
              <Button
                variant="primary"
                size="lg"
                icon={ArrowRight}
                className="w-full sm:w-auto text-base shadow-glow-emerald"
              >
                Get Started Free Now
              </Button>
            </Link>
          </div>

          {/* Trust points */}
          <div className="mt-8 pt-8 border-t border-slate-800/80 flex flex-wrap items-center justify-center gap-8 text-xs text-slate-400">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              HIPAA & GDPR Compliant
            </span>
            <span className="flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-brand-400" />
              24/7 Health Sync
            </span>
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              Zero Credit Card Required
            </span>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default CTA;
