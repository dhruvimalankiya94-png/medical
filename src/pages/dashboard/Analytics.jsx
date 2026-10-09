import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  LineChart, Line, BarChart, Bar, AreaChart, Area, ResponsiveContainer,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ReferenceArea, ReferenceLine
} from 'recharts';
import { LineChart as LineIcon, Loader2, Info } from 'lucide-react';
import { reportsAPI } from '../../services/api';
import { useTheme } from '../../context/ThemeContext';
import Alert from '../../components/common/Alert';

/**
 * Clinical reference ranges used to shade the "healthy" band on each chart.
 * Sources: AHA blood-pressure categories, ADA fasting-glucose criteria,
 * and the WHO BMI classification. See the References section of the report.
 */
const CLINICAL = {
  bpSystolic: { normal: [90, 120], high: 140 },
  bpDiastolic: { normal: [60, 80], high: 90 },
  sugarFasting: { normal: [70, 100], high: 126 },
  heartRate: { normal: [60, 100] },
  bmi: { normal: [18.5, 24.9] },
  sleepGoal: 7,
  waterGoal: 2.5,
  exerciseGoal: 30,
};

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload || payload.length === 0) return null;
  return (
    <div className="bg-white dark:bg-slate-800 p-3 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xl">
      <p className="text-xs font-bold text-slate-900 dark:text-white mb-1">{label}</p>
      {payload.map((entry, i) => (
        <p key={i} className="text-[10px] font-semibold" style={{ color: entry.color }}>
          {entry.name}: {entry.value}
        </p>
      ))}
    </div>
  );
};

/** Caption that explains the shaded band beneath each chart. */
const BandNote = ({ children }) => (
  <p className="flex items-start gap-1.5 text-[10px] text-slate-500 dark:text-slate-400 mt-3">
    <Info className="w-3 h-3 mt-px shrink-0" />
    <span>{children}</span>
  </p>
);

const ChartCard = ({ title, delay = 0, children, note }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay }}
    className="glass-panel p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800/80"
  >
    <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4">{title}</h3>
    <ResponsiveContainer width="100%" height={280}>
      {children}
    </ResponsiveContainer>
    {note && <BandNote>{note}</BandNote>}
  </motion.div>
);

const Analytics = () => {
  const [vitalsData, setVitalsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alertState, setAlertState] = useState(null);
  const { theme } = useTheme();

  // Charts are rendered by recharts into SVG, so they cannot pick up Tailwind
  // `dark:` classes. Resolve the axis/grid colours from the active theme.
  const isDark = theme === 'dark';
  const gridStroke = isDark ? '#1e293b' : '#e2e8f0';
  const tickFill = isDark ? '#94a3b8' : '#64748b';
  const axisTick = { fontSize: 10, fill: tickFill };
  const legendStyle = { fontSize: 10, color: tickFill };
  const bandFill = isDark ? '#10b981' : '#34d399';

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const data = await reportsAPI.getVitalsHistory(30);
      const formatted = (Array.isArray(data) ? data : []).map((d) => ({
        ...d,
        date: d.date?.slice(5) || '',
      }));
      setVitalsData(formatted);
    } catch (err) {
      setAlertState({
        type: 'error',
        title: 'Could not load analytics',
        message: err.message || 'Unable to reach the server. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center py-24"><Loader2 className="w-6 h-6 animate-spin text-brand-500" /></div>;
  }

  return (
    <div className="space-y-8">
      {alertState && <Alert type={alertState.type} title={alertState.title} message={alertState.message} onClose={() => setAlertState(null)} />}

      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/10 text-brand-500 text-xs font-semibold border border-brand-500/30 mb-2">
          <LineIcon className="w-3.5 h-3.5" />
          <span>Health Analytics Dashboard</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">Analytics</h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
          Visualize your health trends over the last 30 days. Shaded bands mark the clinically normal range.
        </p>
      </div>

      {vitalsData.length === 0 ? (
        <div className="glass-panel p-12 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 text-center">
          <LineIcon className="w-12 h-12 text-slate-400 mx-auto mb-3" />
          <p className="text-sm font-bold text-slate-900 dark:text-white">No data available yet</p>
          <p className="text-xs text-slate-400 mt-1">Add health records to see your analytics charts</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Blood Pressure */}
            <ChartCard
              title="Blood Pressure Trend"
              note={`Green band = normal systolic range (${CLINICAL.bpSystolic.normal[0]}–${CLINICAL.bpSystolic.normal[1]} mmHg). Red dashed line = hypertension threshold (${CLINICAL.bpSystolic.high} mmHg).`}
            >
              <LineChart data={vitalsData}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
                <XAxis dataKey="date" tick={axisTick} />
                <YAxis tick={axisTick} domain={[50, 160]} />
                <ReferenceArea
                  y1={CLINICAL.bpSystolic.normal[0]}
                  y2={CLINICAL.bpSystolic.normal[1]}
                  fill={bandFill}
                  fillOpacity={0.1}
                  ifOverflow="extendDomain"
                />
                <ReferenceLine y={CLINICAL.bpSystolic.high} stroke="#ef4444" strokeDasharray="4 4" strokeWidth={1.5} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={legendStyle} iconSize={8} />
                <Line type="monotone" dataKey="bpSystolic" stroke="#10b981" strokeWidth={2} name="Systolic" dot={false} />
                <Line type="monotone" dataKey="bpDiastolic" stroke="#0ea5e9" strokeWidth={2} name="Diastolic" dot={false} />
              </LineChart>
            </ChartCard>

            {/* Blood Sugar */}
            <ChartCard
              title="Fasting Blood Sugar Trend"
              delay={0.1}
              note={`Green band = normal fasting glucose (${CLINICAL.sugarFasting.normal[0]}–${CLINICAL.sugarFasting.normal[1]} mg/dL). Red dashed line = diabetic threshold (${CLINICAL.sugarFasting.high} mg/dL).`}
            >
              <AreaChart data={vitalsData}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
                <XAxis dataKey="date" tick={axisTick} />
                <YAxis tick={axisTick} domain={[50, 180]} />
                <ReferenceArea
                  y1={CLINICAL.sugarFasting.normal[0]}
                  y2={CLINICAL.sugarFasting.normal[1]}
                  fill={bandFill}
                  fillOpacity={0.1}
                  ifOverflow="extendDomain"
                />
                <ReferenceLine y={CLINICAL.sugarFasting.high} stroke="#ef4444" strokeDasharray="4 4" strokeWidth={1.5} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={legendStyle} iconSize={8} />
                <Area type="monotone" dataKey="sugar" stroke="#f59e0b" fill="rgba(245,158,11,0.15)" strokeWidth={2} name="Fasting Sugar (mg/dL)" />
              </AreaChart>
            </ChartCard>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Heart Rate */}
            <ChartCard
              title="Resting Heart Rate Trend"
              delay={0.2}
              note={`Green band = normal resting heart rate (${CLINICAL.heartRate.normal[0]}–${CLINICAL.heartRate.normal[1]} bpm).`}
            >
              <AreaChart data={vitalsData}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
                <XAxis dataKey="date" tick={axisTick} />
                <YAxis tick={axisTick} domain={[40, 120]} />
                <ReferenceArea
                  y1={CLINICAL.heartRate.normal[0]}
                  y2={CLINICAL.heartRate.normal[1]}
                  fill={bandFill}
                  fillOpacity={0.1}
                  ifOverflow="extendDomain"
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={legendStyle} iconSize={8} />
                <Area type="monotone" dataKey="heartRate" stroke="#06b6d4" fill="rgba(6,182,212,0.15)" strokeWidth={2} name="Heart Rate (bpm)" />
              </AreaChart>
            </ChartCard>

            {/* BMI & Weight */}
            <ChartCard
              title="BMI & Weight Trend"
              delay={0.3}
              note={`Green band = healthy BMI range (${CLINICAL.bmi.normal[0]}–${CLINICAL.bmi.normal[1]}), read against the left axis. Weight uses the right axis.`}
            >
              <LineChart data={vitalsData}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
                <XAxis dataKey="date" tick={axisTick} />
                <YAxis yAxisId="bmi" tick={axisTick} domain={[15, 40]} />
                <YAxis yAxisId="weight" orientation="right" tick={axisTick} domain={['dataMin - 3', 'dataMax + 3']} />
                <ReferenceArea
                  yAxisId="bmi"
                  y1={CLINICAL.bmi.normal[0]}
                  y2={CLINICAL.bmi.normal[1]}
                  fill={bandFill}
                  fillOpacity={0.1}
                  ifOverflow="extendDomain"
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={legendStyle} iconSize={8} />
                <Line yAxisId="bmi" type="monotone" dataKey="bmi" stroke="#10b981" strokeWidth={2} name="BMI" dot={false} />
                <Line yAxisId="weight" type="monotone" dataKey="weight" stroke="#f59e0b" strokeWidth={2} name="Weight (kg)" dot={false} />
              </LineChart>
            </ChartCard>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Water & Sleep */}
            <ChartCard
              title="Water Intake & Sleep"
              delay={0.4}
              note={`Dashed lines mark the daily goals: ${CLINICAL.waterGoal} L water (left axis) and ${CLINICAL.sleepGoal} hours sleep (right axis).`}
            >
              <BarChart data={vitalsData}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
                <XAxis dataKey="date" tick={axisTick} />
                <YAxis yAxisId="water" tick={axisTick} domain={[0, 5]} />
                <YAxis yAxisId="sleep" orientation="right" tick={axisTick} domain={[0, 12]} />
                <ReferenceLine yAxisId="water" y={CLINICAL.waterGoal} stroke="#06b6d4" strokeDasharray="4 4" strokeWidth={1.5} />
                <ReferenceLine yAxisId="sleep" y={CLINICAL.sleepGoal} stroke="#8b5cf6" strokeDasharray="4 4" strokeWidth={1.5} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={legendStyle} iconSize={8} />
                <Bar yAxisId="water" dataKey="waterIntake" fill="#06b6d4" name="Water (L)" radius={[4, 4, 0, 0]} />
                <Bar yAxisId="sleep" dataKey="sleepHours" fill="#8b5cf6" name="Sleep (hrs)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ChartCard>

            {/* Exercise & Calories */}
            <ChartCard
              title="Exercise & Calorie Intake"
              delay={0.5}
              note={`Dashed line marks the ${CLINICAL.exerciseGoal}-minute daily activity goal (left axis). Calories use the right axis.`}
            >
              <BarChart data={vitalsData}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
                <XAxis dataKey="date" tick={axisTick} />
                <YAxis yAxisId="exercise" tick={axisTick} />
                <YAxis yAxisId="calories" orientation="right" tick={axisTick} />
                <ReferenceLine yAxisId="exercise" y={CLINICAL.exerciseGoal} stroke="#10b981" strokeDasharray="4 4" strokeWidth={1.5} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={legendStyle} iconSize={8} />
                <Bar yAxisId="exercise" dataKey="exerciseMinutes" fill="#10b981" name="Exercise (min)" radius={[4, 4, 0, 0]} />
                <Bar yAxisId="calories" dataKey="caloriesIntake" fill="#f59e0b" name="Calories (kcal)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ChartCard>
          </div>
        </>
      )}
    </div>
  );
};

export default Analytics;
