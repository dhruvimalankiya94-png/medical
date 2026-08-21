import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, ShieldCheck, Activity, HeartPulse, Scale, Droplets, CheckCircle2, Sparkles, Loader2 } from 'lucide-react';
import { recordsAPI, riskAPI } from '../../services/api';
import Alert from '../../components/common/Alert';
import Button from '../../components/common/Button';

const RiskAssessment = () => {
  const [formData, setFormData] = useState({
    pregnancies: 0,
    glucose: 0,
    bloodPressure: 0,
    skinThickness: 0,
    insulin: 0,
    bmi: 0,
    diabetesPedigreeFunction: 0,
    age: 0,
    type: 'General Checkup',
    doctor: ''
  });

  const [loading, setLoading] = useState(false);
  const [assessmentResult, setAssessmentResult] = useState(null);
  const [assessmentHistory, setAssessmentHistory] = useState([]);
  const [alertState, setAlertState] = useState(null);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const history = await riskAPI.getHistory();
      if (Array.isArray(history) && history.length > 0) {
        setAssessmentHistory(history);
        // Display latest assessment if available
        const latest = history[0];
        setAssessmentResult({
          prediction: latest.prediction,
          riskProbability: latest.riskProbability,
          riskPercentage: latest.riskPercentage,
          riskLevel: latest.riskLevel,
          keyContributingFactors: latest.keyContributingFactors || [],
          modelUsed: latest.modelUsed,
          disclaimer: latest.disclaimer,
          timestamp: latest.timestamp
        });
      }
    } catch (err) {
      console.warn('Notice: Could not fetch prediction history from server:', err.message);
    }
  };

  const handleRunAssessment = async (e) => {
    e.preventDefault();
    setLoading(true);
    setAlertState(null);

    try {
      const res = await recordsAPI.create(formData);
      setLoading(false);

      if (res.assessment) {
        setAssessmentResult(res.assessment);
        setAlertState({
          type: 'success',
          title: 'ML Risk Assessment Completed!',
          message: `Evaluated via Random Forest Model. Calculated Diabetes Risk: ${res.assessment.riskPercentage}% (${res.assessment.riskLevel})`
        });
        fetchHistory();
      } else if (res.mlServiceError) {
        setAlertState({
          type: 'warning',
          title: 'Health Record Saved (ML Service Offline)',
          message: res.mlServiceError
        });
      }
    } catch (error) {
      setLoading(false);
      setAlertState({
        type: 'error',
        title: 'Assessment Failed',
        message: error.message || 'Unable to connect to ML prediction service.'
      });
    }
  };

  const handleHistoryClick = (h) => {
    setAssessmentResult({
      prediction: h.prediction,
      riskProbability: h.riskProbability,
      riskPercentage: h.riskPercentage,
      riskLevel: h.riskLevel,
      keyContributingFactors: h.keyContributingFactors || [],
      modelUsed: h.modelUsed,
      disclaimer: h.disclaimer,
      timestamp: h.timestamp || h.createdAt
    });
  };

  return (
    <div className="space-y-8">
      
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/10 text-brand-500 text-xs font-semibold border border-brand-500/30 mb-2">
          <AlertTriangle className="w-3.5 h-3.5" />
          <span>Risk Assessment Engine</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Diabetes Health Risk Assessment
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
          Powered by a trained Random Forest Classifier
        </p>
      </div>

      {alertState && (
        <Alert
          type={alertState.type}
          title={alertState.title}
          message={alertState.message}
          onClose={() => setAlertState(null)}
        />
      )}

      {/* Risk Assessment Form */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Interactive Input Form */}
        <div className="lg:col-span-7 glass-panel p-6 sm:p-8 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 space-y-6 shadow-xl">
          <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-4">
            <Sparkles className="w-5 h-5 text-brand-500" />
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Input Health Vitals</h2>
          </div>

          <form onSubmit={handleRunAssessment} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Pregnancies
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.pregnancies}
                  onChange={(e) => setFormData({ ...formData, pregnancies: Number(e.target.value) })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-white text-xs font-medium focus:ring-2 focus:ring-brand-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Plasma Glucose (mg/dL)
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.glucose}
                  onChange={(e) => setFormData({ ...formData, glucose: Number(e.target.value) })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-white text-xs font-medium focus:ring-2 focus:ring-brand-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Diastolic Blood Pressure (mmHg)
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.bloodPressure}
                  onChange={(e) => setFormData({ ...formData, bloodPressure: Number(e.target.value) })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-white text-xs font-medium focus:ring-2 focus:ring-brand-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Skin Thickness (mm)
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.skinThickness}
                  onChange={(e) => setFormData({ ...formData, skinThickness: Number(e.target.value) })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-white text-xs font-medium focus:ring-2 focus:ring-brand-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  2-Hour Insulin (mu U/ml)
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.insulin}
                  onChange={(e) => setFormData({ ...formData, insulin: Number(e.target.value) })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-white text-xs font-medium focus:ring-2 focus:ring-brand-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Body Mass Index (BMI)
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  value={formData.bmi}
                  onChange={(e) => setFormData({ ...formData, bmi: Number(e.target.value) })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-white text-xs font-medium focus:ring-2 focus:ring-brand-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Diabetes Pedigree Score
                </label>
                <input
                  type="number"
                  step="0.001"
                  min="0"
                  value={formData.diabetesPedigreeFunction}
                  onChange={(e) => setFormData({ ...formData, diabetesPedigreeFunction: Number(e.target.value) })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-white text-xs font-medium focus:ring-2 focus:ring-brand-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Age (Years)
                </label>
                <input
                  type="number"
                  min="1"
                  value={formData.age}
                  onChange={(e) => setFormData({ ...formData, age: Number(e.target.value) })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-white text-xs font-medium focus:ring-2 focus:ring-brand-500 focus:outline-none"
                  required
                />
              </div>
            </div>

            <Button type="submit" className="w-full mt-4" disabled={loading}>
              {loading ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Running Risk Assessment...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Activity className="w-4 h-4" />
                  Execute Risk Prediction
                </span>
              )}
            </Button>
          </form>
        </div>

        {/* Right Column: Real Prediction Output Display */}
        <div className="lg:col-span-5 space-y-6">
          {assessmentResult ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 space-y-6 shadow-glow-cyan bg-slate-950/90 text-white"
            >
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Model Output</span>
                  <h3 className="text-xl font-extrabold text-white">Health Risk Estimate</h3>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-extrabold ${
                  assessmentResult.riskLevel === 'High Risk'
                    ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                    : assessmentResult.riskLevel === 'Moderate Risk'
                    ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                    : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                }`}>
                  {assessmentResult.riskLevel}
                </span>
              </div>

              <div className="text-center py-4 space-y-2">
                <p className="text-xs text-slate-400 font-medium">Risk Probability</p>
                <div className="text-5xl font-black text-gradient">
                  {assessmentResult.riskPercentage}%
                </div>
                <p className="text-xs text-slate-400">
                  Model Prediction: <span className="font-bold text-white">{assessmentResult.prediction === 1 ? 'Positive Risk' : 'Negative Risk'}</span>
                </p>
              </div>

              {/* Key Factors */}
              {assessmentResult.keyContributingFactors && assessmentResult.keyContributingFactors.length > 0 && (
                <div className="space-y-2 bg-slate-900/80 p-4 rounded-2xl border border-slate-800">
                  <span className="text-xs font-bold text-slate-300">Key Contributing Factors:</span>
                  <ul className="space-y-1">
                    {assessmentResult.keyContributingFactors.map((factor, idx) => (
                      <li key={idx} className="text-xs text-amber-400 flex items-center gap-2">
                        <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                        <span>{factor}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Medical Safety Disclaimer */}
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[11px] leading-relaxed">
                <span className="font-bold block mb-1">⚠️ Medical Disclaimer:</span>
                {assessmentResult.disclaimer}
              </div>
            </motion.div>
          ) : (
            <div className="glass-panel p-8 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 text-center space-y-3">
              <ShieldCheck className="w-12 h-12 text-slate-500 mx-auto" />
              <h3 className="text-base font-bold text-slate-900 dark:text-white">No Prediction Executed Yet</h3>
              <p className="text-xs text-slate-400">
                Fill in the vitals on the left and click "Execute Risk Prediction" to view results.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* PREDICTION HISTORY TABLE */}
      {assessmentHistory.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="glass-panel p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 shadow-xl">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <Activity className="w-4 h-4 text-brand-500" />
            Previous Risk Predictions ({assessmentHistory.length})
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">
                  <th className="text-left py-2 px-3">Date</th>
                  <th className="text-center py-2 px-3">Glucose</th>
                  <th className="text-center py-2 px-3">BP</th>
                  <th className="text-center py-2 px-3">BMI</th>
                  <th className="text-center py-2 px-3">Age</th>
                  <th className="text-center py-2 px-3">Risk %</th>
                  <th className="text-center py-2 px-3">Level</th>
                  <th className="text-center py-2 px-3">Prediction</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                {assessmentHistory.map((h, idx) => (
                  <tr key={h._id || idx} onClick={() => handleHistoryClick(h)} className="hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors cursor-pointer">
                    <td className="py-2.5 px-3 font-semibold text-slate-900 dark:text-white whitespace-nowrap">
                      {new Date(h.createdAt || h.timestamp).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="py-2.5 px-3 text-center text-slate-600 dark:text-slate-300">{h.inputs?.glucose || '-'}</td>
                    <td className="py-2.5 px-3 text-center text-slate-600 dark:text-slate-300">{h.inputs?.bloodPressure || '-'}</td>
                    <td className="py-2.5 px-3 text-center text-slate-600 dark:text-slate-300">{h.inputs?.bmi || '-'}</td>
                    <td className="py-2.5 px-3 text-center text-slate-600 dark:text-slate-300">{h.inputs?.age || '-'}</td>
                    <td className="py-2.5 px-3 text-center font-black text-slate-900 dark:text-white">{h.riskPercentage}%</td>
                    <td className="py-2.5 px-3 text-center">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                        h.riskLevel === 'High Risk'
                          ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                          : h.riskLevel === 'Moderate Risk'
                          ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                          : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      }`}>
                        {h.riskLevel}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <span className={`font-bold ${h.prediction === 1 ? 'text-rose-400' : 'text-emerald-400'}`}>
                        {h.prediction === 1 ? 'Positive' : 'Negative'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}

    </div>
  );
};

export default RiskAssessment;
