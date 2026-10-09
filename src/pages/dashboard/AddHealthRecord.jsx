import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  PlusCircle, User, Activity, HeartPulse, Scale,
  Droplets, ShieldCheck, Loader2, FileText, Sparkles,
  Moon, Flame, Footprints, Dumbbell, Ruler, Smile
} from 'lucide-react';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import Alert from '../../components/common/Alert';
import { recordsAPI } from '../../services/api';

const MOOD_OPTIONS = ['great', 'good', 'okay', 'bad', 'terrible'];

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
    heartRate: '',
    weight: '',
    height: '',
    sleepHours: '',
    waterIntake: '',
    exerciseMinutes: '',
    caloriesIntake: '',
    stepsCount: '',
    mood: '',
    doctor: '',
    type: '',
    notes: ''
  });

  // BMI is derived from height + weight when both are present, using the same
  // formula as the HealthRecord pre-save hook so the stored value and the value
  // sent to the ML service never disagree.
  const bmiIsDerived = Number(formData.height) > 0 && Number(formData.weight) > 0;

  const updateField = (field, value) => {
    setFormData((prev) => {
      const next = { ...prev, [field]: value };
      if (field === 'height' || field === 'weight') {
        const h = Number(next.height) / 100;
        const w = Number(next.weight);
        if (h > 0 && w > 0) {
          next.bmi = String(Math.round((w / (h * h)) * 10) / 10);
        }
      }
      return next;
    });
  };

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
          heartRate: Number(formData.heartRate) || 0,
        },
        bmi: Number(formData.bmi) || 0,
        weight: Number(formData.weight) || 0,
        height: Number(formData.height) || 0,
        sleepHours: Number(formData.sleepHours) || 0,
        waterIntake: Number(formData.waterIntake) || 0,
        exerciseMinutes: Number(formData.exerciseMinutes) || 0,
        caloriesIntake: Number(formData.caloriesIntake) || 0,
        stepsCount: Number(formData.stepsCount) || 0,
        mood: formData.mood || undefined,
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
              1. Demographics &amp; Checkup Meta
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input
              label="Age (Years)"
              id="age"
              type="number"
              value={formData.age}
              onChange={(e) => updateField('age', e.target.value)}
              required
            />
            <Input
              label="Checkup Type"
              id="type"
              value={formData.type}
              onChange={(e) => updateField('type', e.target.value)}
              required
            />
            <Input
              label="Attending Doctor"
              id="doctor"
              value={formData.doctor}
              onChange={(e) => updateField('doctor', e.target.value)}
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
              onChange={(e) => updateField('pregnancies', e.target.value)}
              required
            />
            <Input
              label="Plasma Glucose (mg/dL)"
              id="glucose"
              type="number"
              value={formData.glucose}
              onChange={(e) => updateField('glucose', e.target.value)}
              required
            />
            <Input
              label="Systolic Blood Pressure (mmHg)"
              id="bpSystolic"
              type="number"
              value={formData.bpSystolic}
              onChange={(e) => updateField('bpSystolic', e.target.value)}
              helperText="Upper reading, e.g. 120"
              required
            />
            <Input
              label="Diastolic Blood Pressure (mmHg)"
              id="bpDiastolic"
              type="number"
              value={formData.bpDiastolic}
              onChange={(e) => updateField('bpDiastolic', e.target.value)}
              helperText="Lower reading, e.g. 80"
              required
            />
            <Input
              label="Resting Heart Rate (bpm)"
              id="heartRate"
              type="number"
              value={formData.heartRate}
              onChange={(e) => updateField('heartRate', e.target.value)}
            />
            <Input
              label="Skin Thickness (mm)"
              id="skinThickness"
              type="number"
              value={formData.skinThickness}
              onChange={(e) => updateField('skinThickness', e.target.value)}
              required
            />
            <Input
              label="2-Hour Insulin (mu U/ml)"
              id="insulin"
              type="number"
              value={formData.insulin}
              onChange={(e) => updateField('insulin', e.target.value)}
              required
            />
            <Input
              label="Diabetes Pedigree Function"
              id="diabetesPedigreeFunction"
              type="number"
              step="0.001"
              value={formData.diabetesPedigreeFunction}
              onChange={(e) => updateField('diabetesPedigreeFunction', e.target.value)}
              required
            />
          </div>
        </div>

        {/* SECTION 3: Body Measurements */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
            <Scale className="w-4 h-4 text-violet-400" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              3. Body Measurements
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input
              label="Weight (kg)"
              id="weight"
              type="number"
              step="0.1"
              icon={Scale}
              value={formData.weight}
              onChange={(e) => updateField('weight', e.target.value)}
            />
            <Input
              label="Height (cm)"
              id="height"
              type="number"
              step="0.1"
              icon={Ruler}
              value={formData.height}
              onChange={(e) => updateField('height', e.target.value)}
            />
            <Input
              label="Body Mass Index (BMI)"
              id="bmi"
              type="number"
              step="0.1"
              value={formData.bmi}
              onChange={(e) => updateField('bmi', e.target.value)}
              readOnly={bmiIsDerived}
              helperText={bmiIsDerived ? 'Auto-calculated from height & weight' : 'Or enter height & weight to auto-calculate'}
              required
            />
          </div>
        </div>

        {/* SECTION 4: Lifestyle & Activity */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
            <Activity className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              4. Lifestyle &amp; Activity
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input
              label="Sleep (hours)"
              id="sleepHours"
              type="number"
              step="0.1"
              icon={Moon}
              value={formData.sleepHours}
              onChange={(e) => updateField('sleepHours', e.target.value)}
            />
            <Input
              label="Water Intake (litres)"
              id="waterIntake"
              type="number"
              step="0.1"
              icon={Droplets}
              value={formData.waterIntake}
              onChange={(e) => updateField('waterIntake', e.target.value)}
            />
            <Input
              label="Exercise (minutes)"
              id="exerciseMinutes"
              type="number"
              icon={Dumbbell}
              value={formData.exerciseMinutes}
              onChange={(e) => updateField('exerciseMinutes', e.target.value)}
            />
            <Input
              label="Calories Intake (kcal)"
              id="caloriesIntake"
              type="number"
              icon={Flame}
              value={formData.caloriesIntake}
              onChange={(e) => updateField('caloriesIntake', e.target.value)}
            />
            <Input
              label="Steps Count"
              id="stepsCount"
              type="number"
              icon={Footprints}
              value={formData.stepsCount}
              onChange={(e) => updateField('stepsCount', e.target.value)}
            />

            <div className="space-y-1.5 w-full">
              <label htmlFor="mood" className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Mood
              </label>
              <div className="relative rounded-xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
                  <Smile className="w-4 h-4" />
                </div>
                <select
                  id="mood"
                  value={formData.mood}
                  onChange={(e) => updateField('mood', e.target.value)}
                  className="w-full py-2.5 pl-10 pr-3 text-sm rounded-xl bg-white/70 dark:bg-slate-900/80 border border-slate-300/80 dark:border-slate-800/80 text-slate-900 dark:text-white transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:border-brand-500 focus:ring-brand-500/30"
                >
                  <option value="">Not specified</option>
                  {MOOD_OPTIONS.map((m) => (
                    <option key={m} value={m}>
                      {m.charAt(0).toUpperCase() + m.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 5: Notes */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
            <FileText className="w-4 h-4 text-amber-400" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              5. Notes
            </h3>
          </div>

          <div>
            <textarea
              rows="3"
              value={formData.notes}
              onChange={(e) => updateField('notes', e.target.value)}
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
                Save &amp; Predict Risk
              </>
            )}
          </Button>
        </div>

      </form>
    </div>
  );
};

export default AddHealthRecord;
