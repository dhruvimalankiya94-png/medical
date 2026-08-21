import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  PlusCircle, User, Activity, HeartPulse, Scale, 
  Droplets, ShieldCheck, ArrowRight, Loader2, FileText, 
  AlertTriangle, CheckCircle2, Sparkles
} from 'lucide-react';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import Alert from '../../components/common/Alert';
import { recordsAPI } from '../../services/api';

const AddHealthRecord = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [alertState, setAlertState] = useState(null);
  const [prediction, setPrediction] = useState(null);

  const [formData, setFormData] = useState({
    age: '',
    pregnancies: '',
    glucose: '',
    bpSystolic: '',
    bpDiastolic: '',
    skinThickness: '',
    insulin: '',
    bmi: '',
    diabetesPedigreeFunction: '',
    doctor: '',
    type: '',
    notes: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setAlertState(null);
    setPrediction(null);

    try {
      const payload = {
        recordType: formData.type || 'General Checkup',
        vitals: {
          bpSystolic: Number(formData.bpSystolic) || 0,
          bpDiastolic: Number(formData.bpDiastolic) || 0,
          sugarFasting: Number(formData.glucose) || 0,
        },
        bmi: Number(formData.bmi) || 0,
        sleepHours: 0,
        waterIntake: 0,
        notes: formData.notes,
        doctor: formData.doctor,
        age: Number(formData.age) || 0,
        pregnancies: Number(formData.pregnancies) || 0,
        glucose: Number(formData.glucose) || 0,
        bloodPressure: Number(formData.bpDiastolic) || 0,
        skinThickness: Number(formData.skinThickness) || 0,
        insulin: Number(formData.insulin) || 0,
        diabetesPedigreeFunction: Number(formData.diabetesPedigreeFunction) || 0,
      };

      const res = await recordsAPI.create(payload);
      setLoading(false);

      if (res.assessment) {
        setPrediction(res.assessment);
        setAlertState({
          type: 'success',
          title: 'Health Record Saved & Risk Assessed!',
          message: `ML Prediction: ${res.assessment.riskLevel} (${res.assessment.riskPercentage}% risk)`
        });
      } else if (res.mlServiceError) {
        setAlertState({
          type: 'warning',
          title: 'Record Saved (ML Service Unavailable)',
          message: 'Health record saved but risk prediction could not be generated. Start the ML service on port 8000.'
        });
      } else {
        setAlertState({
          type: 'success',
          title: 'Health Record Saved!',
          message: 'Your health record has been saved successfully.'
        });
      }
    } catch (error) {
      setLoading(false);
      setAlertState({
        type: 'error',
        title: 'Record Logging Failed',
        message: error.message || 'Unable to save record to server.'
      });
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/10 text-brand-500 text-xs font-semibold border border-brand-500/30 mb-2">
          <PlusCircle className="w-3.5 h-3.5" />
          <span>Health Record Entry</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Add New Health Record
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
          Logs your health data securely to the server
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

      {/* ML PREDICTION RESULT */}
      {prediction && (
        <div className={`glass-panel p-6 rounded-3xl border-2 shadow-xl ${
          prediction.riskLevel === 'High Risk' 
            ? 'border-rose-500/50 bg-rose-500/5' 
            : prediction.riskLevel === 'Moderate Risk' 
            ? 'border-amber-500/50 bg-amber-500/5' 
            : 'border-emerald-500/50 bg-emerald-500/5'
        }`}>
          <div className="flex items-center gap-3 mb-4">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
              prediction.riskLevel === 'High Risk' 
                ? 'bg-rose-500/20 text-rose-400' 
                : prediction.riskLevel === 'Moderate Risk' 
                ? 'bg-amber-500/20 text-amber-400' 
                : 'bg-emerald-500/20 text-emerald-400'
            }`}>
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">ML Risk Prediction Result</h3>
              <p className="text-[10px] text-slate-400">{prediction.modelUsed}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
            <div className="p-4 rounded-2xl bg-white/50 dark:bg-slate-900/50 text-center">
              <p className={`text-2xl font-black ${
                prediction.riskLevel === 'High Risk' ? 'text-rose-400' 
                : prediction.riskLevel === 'Moderate Risk' ? 'text-amber-400' 
                : 'text-emerald-400'
              }`}>
                {prediction.riskPercentage}%
              </p>
              <p className="text-[10px] text-slate-400 font-bold mt-1">Risk Score</p>
            </div>
            <div className="p-4 rounded-2xl bg-white/50 dark:bg-slate-900/50 text-center">
              <p className={`text-lg font-black ${
                prediction.riskLevel === 'High Risk' ? 'text-rose-400' 
                : prediction.riskLevel === 'Moderate Risk' ? 'text-amber-400' 
                : 'text-emerald-400'
              }`}>
                {prediction.riskLevel}
              </p>
              <p className="text-[10px] text-slate-400 font-bold mt-1">Risk Level</p>
            </div>
            <div className="p-4 rounded-2xl bg-white/50 dark:bg-slate-900/50 text-center">
              <p className="text-lg font-black text-slate-900 dark:text-white">
                {prediction.prediction === 1 ? 'Positive' : 'Negative'}
              </p>
              <p className="text-[10px] text-slate-400 font-bold mt-1">Diabetes Prediction</p>
            </div>
          </div>

          {prediction.keyContributingFactors && prediction.keyContributingFactors.length > 0 && (
            <div className="p-3 rounded-xl bg-white/30 dark:bg-slate-900/30">
              <p className="text-[10px] font-bold text-slate-500 mb-2">Key Contributing Factors:</p>
              <div className="flex flex-wrap gap-2">
                {prediction.keyContributingFactors.map((factor, idx) => (
                  <span key={idx} className="px-2 py-1 rounded-lg bg-amber-500/10 text-amber-500 text-[10px] font-semibold border border-amber-500/20">
                    {factor}
                  </span>
                ))}
              </div>
            </div>
          )}

          {prediction.disclaimer && (
            <p className="text-[9px] text-slate-400 mt-3 italic">{prediction.disclaimer}</p>
          )}
        </div>
      )}

      {/* FORM CARD */}
      <form onSubmit={handleSubmit} className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 space-y-8 shadow-xl">
        
        {/* SECTION 1: Patient Demographics */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
            <User className="w-4 h-4 text-brand-500" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              1. Demographics & Checkup Meta
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input
              label="Age (Years)"
              id="age"
              type="number"
              value={formData.age}
              onChange={(e) => setFormData({ ...formData, age: e.target.value })}
              required
            />
            <Input
              label="Checkup Type"
              id="type"
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              required
            />
            <Input
              label="Attending Doctor"
              id="doctor"
              value={formData.doctor}
              onChange={(e) => setFormData({ ...formData, doctor: e.target.value })}
              required
            />
          </div>
        </div>

        {/* SECTION 2: Health Vitals */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
            <HeartPulse className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              2. Health Vitals (ML Prediction Input)
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input
              label="Pregnancies"
              id="pregnancies"
              type="number"
              value={formData.pregnancies}
              onChange={(e) => setFormData({ ...formData, pregnancies: e.target.value })}
              required
            />
            <Input
              label="Plasma Glucose (mg/dL)"
              id="glucose"
              type="number"
              value={formData.glucose}
              onChange={(e) => setFormData({ ...formData, glucose: e.target.value })}
              required
            />
            <Input
              label="Diastolic Blood Pressure (mmHg)"
              id="bpDiastolic"
              type="number"
              value={formData.bpDiastolic}
              onChange={(e) => setFormData({ ...formData, bpDiastolic: e.target.value })}
              required
            />
            <Input
              label="Skin Thickness (mm)"
              id="skinThickness"
              type="number"
              value={formData.skinThickness}
              onChange={(e) => setFormData({ ...formData, skinThickness: e.target.value })}
              required
            />
            <Input
              label="2-Hour Insulin (mu U/ml)"
              id="insulin"
              type="number"
              value={formData.insulin}
              onChange={(e) => setFormData({ ...formData, insulin: e.target.value })}
              required
            />
            <Input
              label="Body Mass Index (BMI)"
              id="bmi"
              type="number"
              step="0.1"
              value={formData.bmi}
              onChange={(e) => setFormData({ ...formData, bmi: e.target.value })}
              required
            />
            <Input
              label="Diabetes Pedigree Function"
              id="diabetesPedigreeFunction"
              type="number"
              step="0.001"
              value={formData.diabetesPedigreeFunction}
              onChange={(e) => setFormData({ ...formData, diabetesPedigreeFunction: e.target.value })}
              required
            />
          </div>
        </div>

        {/* SECTION 3: Notes */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
            <FileText className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              3. Notes
            </h3>
          </div>

          <div>
            <textarea
              rows="3"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:outline-none"
              placeholder="Additional notes about this record..."
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/records')}
          >
            Cancel
          </Button>

          <Button type="submit" disabled={loading} className="flex items-center gap-2">
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Running ML Assessment...
              </>
            ) : (
              <>
                <ShieldCheck className="w-4 h-4" />
                Save & Predict Risk
              </>
            )}
          </Button>
        </div>

      </form>
    </div>
  );
};

export default AddHealthRecord;
