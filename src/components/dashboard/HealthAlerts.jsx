import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, AlertOctagon, Info, ShieldCheck, ChevronDown, ChevronUp } from 'lucide-react';
import { alertsAPI } from '../../services/api';

const SEVERITY_STYLES = {
  critical: {
    Icon: AlertOctagon,
    wrapper: 'border-rose-500/50 bg-rose-500/5',
    chip: 'bg-rose-500/15 text-rose-500 border-rose-500/30',
    iconBox: 'bg-rose-500/15 text-rose-500',
    label: 'Critical',
  },
  warning: {
    Icon: AlertTriangle,
    wrapper: 'border-amber-500/50 bg-amber-500/5',
    chip: 'bg-amber-500/15 text-amber-500 border-amber-500/30',
    iconBox: 'bg-amber-500/15 text-amber-500',
    label: 'Warning',
  },
  info: {
    Icon: Info,
    wrapper: 'border-sky-500/40 bg-sky-500/5',
    chip: 'bg-sky-500/15 text-sky-500 border-sky-500/30',
    iconBox: 'bg-sky-500/15 text-sky-500',
    label: 'Notice',
  },
};

/**
 * Threshold-based health alerts for the signed-in user.
 * Alerts are derived server side from the most recent health record, so this
 * component only presents them. Dismissal is per-session and intentionally not
 * persisted, because an unresolved clinical reading should reappear on reload.
 */
const HealthAlerts = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dismissed, setDismissed] = useState([]);
  const [expanded, setExpanded] = useState(true);

  useEffect(() => {
    let cancelled = false;
    alertsAPI
      .getAll()
      .then((res) => {
        if (!cancelled) setData(res);
      })
      .catch(() => {
        // Alerts are supplementary; a failure here must not break the dashboard.
        if (!cancelled) setData(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading || !data) return null;

  const visible = (data.alerts || []).filter((a) => !dismissed.includes(a.id));
  const actionable = visible.filter((a) => a.severity !== 'info');

  // All clear: one compact reassurance row rather than an empty gap.
  if (visible.length === 0) {
    return (
      <div className="glass-panel p-4 rounded-2xl border border-emerald-500/40 bg-emerald-500/5 flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-emerald-500/15 text-emerald-500 flex items-center justify-center shrink-0">
          <ShieldCheck className="w-4 h-4" />
        </div>
        <div>
          <p className="text-sm font-bold text-slate-900 dark:text-white">All readings within normal range</p>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            No threshold breaches detected in your latest health record.
          </p>
        </div>
      </div>
    );
  }

  const headline =
    actionable.length > 0
      ? `${actionable.length} reading${actionable.length > 1 ? 's' : ''} need attention`
      : `${visible.length} health notice${visible.length > 1 ? 's' : ''}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-panel rounded-2xl border border-slate-200/80 dark:border-slate-800/80 overflow-hidden"
    >
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="w-full flex items-center justify-between gap-3 p-4 text-left hover:bg-slate-500/5 transition-colors"
        aria-expanded={expanded}
      >
        <div className="flex items-center gap-3 min-w-0">
          <div
            className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
              actionable.length > 0 ? 'bg-amber-500/15 text-amber-500' : 'bg-sky-500/15 text-sky-500'
            }`}
          >
            <AlertTriangle className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-bold text-slate-900 dark:text-white truncate">Health Alerts &middot; {headline}</p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Automatically screened against clinical reference ranges
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {data.counts?.critical > 0 && (
            <span className="px-2 py-0.5 rounded-lg text-[10px] font-bold border bg-rose-500/15 text-rose-500 border-rose-500/30">
              {data.counts.critical} critical
            </span>
          )}
          {expanded ? (
            <ChevronUp className="w-4 h-4 text-slate-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-slate-400" />
          )}
        </div>
      </button>

      {expanded && (
        <div className="px-4 pb-4 space-y-2.5">
          {visible.map((alert) => {
            const style = SEVERITY_STYLES[alert.severity] || SEVERITY_STYLES.info;
            const { Icon } = style;
            return (
              <div key={alert.id} className={`p-3.5 rounded-xl border ${style.wrapper}`}>
                <div className="flex items-start gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${style.iconBox}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className={`px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wide border ${style.chip}`}>
                        {style.label}
                      </span>
                      <p className="text-xs font-bold text-slate-900 dark:text-white">{alert.title}</p>
                    </div>
                    <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">{alert.message}</p>
                    {alert.value && (
                      <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-[10px] text-slate-500 dark:text-slate-400">
                        <span>
                          <span className="font-bold">Your reading:</span> {alert.value}
                        </span>
                        {alert.threshold && (
                          <span>
                            <span className="font-bold">Reference limit:</span> {alert.threshold}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => setDismissed((prev) => [...prev, alert.id])}
                    className="text-[10px] font-bold text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 shrink-0 px-1"
                    aria-label={`Dismiss ${alert.title}`}
                  >
                    Hide
                  </button>
                </div>
              </div>
            );
          })}

          {data.disclaimer && (
            <p className="text-[9px] text-slate-400 italic pt-1">{data.disclaimer}</p>
          )}
        </div>
      )}
    </motion.div>
  );
};

export default HealthAlerts;
