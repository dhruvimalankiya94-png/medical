import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FileText, Download, Loader2, Calendar, Activity, TrendingUp } from 'lucide-react';
import { reportsAPI } from '../../services/api';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import Alert from '../../components/common/Alert';

const Reports = () => {
  const [reportType, setReportType] = useState('weekly');
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [alertState, setAlertState] = useState(null);

  useEffect(() => {
    fetchReport();
  }, [reportType]);

  const fetchReport = async () => {
    setLoading(true);
    try {
      const data = reportType === 'weekly'
        ? await reportsAPI.getWeekly()
        : await reportsAPI.getMonthly();
      setReportData(data);
    } catch (err) {
      setAlertState({ type: 'warning', title: 'Notice', message: 'No data available. Add health records first.' });
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = async () => {
    setDownloading(true);
    try {
      const { default: jsPDF } = await import('jspdf');
      const doc = new jsPDF();
      const s = reportData?.summary || {};

      doc.setFontSize(18);
      doc.text('Smart Healthcare Analytics', 20, 20);
      doc.setFontSize(12);
      doc.text(`${reportType === 'weekly' ? 'Weekly' : 'Monthly'} Health Report`, 20, 30);
      doc.text(`Generated: ${new Date().toLocaleDateString('en-IN')}`, 20, 38);

      doc.setDrawColor(16, 185, 129);
      doc.line(20, 42, 190, 42);

      let y = 55;
      doc.setFontSize(11);
      doc.text('Health Summary', 20, y);
      y += 10;
      doc.setFontSize(10);
      doc.text(`Total Records: ${s.totalRecords || 0}`, 25, y); y += 8;
      doc.text(`Tasks Completed: ${s.completedTasks || 0} / ${s.totalTasks || 0} (${s.taskCompletionRate || 0}%)`, 25, y); y += 8;
      doc.text(`Average Blood Pressure: ${s.avgBpSystolic || 0}/${s.avgBpDiastolic || 0} mmHg`, 25, y); y += 8;
      doc.text(`Average Blood Sugar: ${s.avgSugar || 0} mg/dL`, 25, y); y += 8;
      doc.text(`Average BMI: ${s.avgBMI || 0}`, 25, y); y += 8;
      doc.text(`Average Sleep: ${s.avgSleepHours || 0} hours`, 25, y); y += 8;
      doc.text(`Total Water Intake: ${s.totalWaterIntake || 0} L`, 25, y); y += 8;
      doc.text(`Total Exercise: ${s.totalExerciseMinutes || 0} minutes`, 25, y); y += 15;

      doc.setFontSize(11);
      doc.text('Disclaimer: This report is for personal health tracking purposes only.', 20, y);
      doc.text('It is not a medical diagnosis. Consult a doctor for medical advice.', 20, y + 8);

      doc.save(`HealthPulse_${reportType}_report_${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (err) {
      setAlertState({ type: 'error', title: 'Error', message: 'Failed to generate PDF' });
    } finally {
      setDownloading(false);
    }
  };

  const s = reportData?.summary || {};

  return (
    <div className="space-y-8">
      {alertState && <Alert type={alertState.type} title={alertState.title} message={alertState.message} onClose={() => setAlertState(null)} />}

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/10 text-brand-500 text-xs font-semibold border border-brand-500/30 mb-2">
            <FileText className="w-3.5 h-3.5" />
            <span>Health Reports</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">{reportType === 'weekly' ? 'Weekly' : 'Monthly'} Report</h1>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex bg-slate-100 dark:bg-slate-900 rounded-xl p-1 border border-slate-200 dark:border-slate-800">
            <button onClick={() => setReportType('weekly')} className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${reportType === 'weekly' ? 'bg-brand-500 text-white' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'}`}>Weekly</button>
            <button onClick={() => setReportType('monthly')} className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${reportType === 'monthly' ? 'bg-brand-500 text-white' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'}`}>Monthly</button>
          </div>
          <button onClick={handleDownloadPDF} disabled={downloading || !reportData} className="px-4 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 disabled:opacity-50 text-white text-xs font-bold flex items-center gap-2 transition-all">
            {downloading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
            Download PDF
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-24"><Loader2 className="w-6 h-6 animate-spin text-brand-500" /></div>
      ) : !reportData ? (
        <div className="glass-panel p-12 rounded-3xl border text-center">
          <FileText className="w-12 h-12 text-slate-400 mx-auto mb-3" />
          <p className="text-sm font-bold text-slate-900 dark:text-white">No data available</p>
          <p className="text-xs text-slate-400 mt-1">Add health records to generate reports</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: 'Avg Blood Pressure', value: `${s.avgBpSystolic || 0}/${s.avgBpDiastolic || 0}`, icon: Activity, color: 'text-emerald-400' },
              { label: 'Avg Blood Sugar', value: `${s.avgSugar || 0} mg/dL`, icon: TrendingUp, color: 'text-amber-400' },
              { label: 'Task Completion', value: `${s.taskCompletionRate || 0}%`, icon: Calendar, color: 'text-cyan-400' },
              { label: 'Avg Sleep', value: `${s.avgSleepHours || 0} hrs`, icon: FileText, color: 'text-indigo-400' },
            ].map((card, idx) => {
              const Icon = card.icon;
              return (
                <motion.div key={card.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1 }}
                  className="glass-panel p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800/80">
                  <Icon className={`w-5 h-5 ${card.color} mb-2`} />
                  <p className="text-lg font-black text-slate-900 dark:text-white">{card.value}</p>
                  <p className="text-[10px] text-slate-400 font-semibold">{card.label}</p>
                </motion.div>
              );
            })}
          </div>

          {(reportData.dailyBreakdown || reportData.weeklyBreakdown) && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
              className="glass-panel p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800/80">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4">
                {reportType === 'weekly' ? 'Daily' : 'Weekly'} Breakdown
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-800">
                      <th className="text-left py-2 px-3 font-bold text-slate-500">{reportType === 'weekly' ? 'Day' : 'Week'}</th>
                      <th className="text-center py-2 px-3 font-bold text-slate-500">Records</th>
                      <th className="text-center py-2 px-3 font-bold text-slate-500">Tasks Done</th>
                      <th className="text-center py-2 px-3 font-bold text-slate-500">Total Tasks</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(reportData.dailyBreakdown || reportData.weeklyBreakdown || []).map((row, i) => (
                      <tr key={i} className="border-b border-slate-100 dark:border-slate-800/50">
                        <td className="py-2 px-3 font-semibold text-slate-900 dark:text-white">{reportType === 'weekly' ? `${row.day} ${row.date}` : `Week ${row.week}`}</td>
                        <td className="py-2 px-3 text-center text-slate-600 dark:text-slate-300">{row.recordsLogged}</td>
                        <td className="py-2 px-3 text-center text-emerald-500 font-bold">{row.tasksCompleted}</td>
                        <td className="py-2 px-3 text-center text-slate-600 dark:text-slate-300">{row.tasksTotal}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}

          <div className="glass-panel p-4 rounded-2xl border border-amber-500/30 bg-amber-500/5">
            <p className="text-[11px] text-amber-600 dark:text-amber-400 font-semibold">
              Disclaimer: This report is for personal health tracking only. It is not a medical diagnosis. Always consult a healthcare professional for medical advice.
            </p>
          </div>
        </>
      )}
    </div>
  );
};

export default Reports;
