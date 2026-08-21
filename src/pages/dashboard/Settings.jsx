import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Settings as SettingsIcon, Sun, Moon, Bell, ShieldCheck, Globe, LogOut, CheckCircle2 } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import Checkbox from '../../components/common/Checkbox';
import Button from '../../components/common/Button';
import Alert from '../../components/common/Alert';
import { useNavigate } from 'react-router-dom';

const Settings = () => {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const [alertState, setAlertState] = useState(null);

  const [notifications, setNotifications] = useState({
    emailAlerts: true,
    pushNotifications: true,
    emergencySMS: true,
    weeklyReport: false
  });

  const [privacy, setPrivacy] = useState({
    anonymizeData: true,
    hipaaSharing: true
  });

  const [language, setLanguage] = useState('English (US)');

  const handleSaveSettings = () => {
    localStorage.setItem('healthpulse_settings', JSON.stringify({ notifications, privacy, language }));
    setAlertState({
      type: 'success',
      title: 'Settings Saved Successfully!',
      message: 'Your system preferences and privacy controls have been updated.'
    });
  };

  const handleLogout = () => {
    setAlertState({
      type: 'info',
      title: 'Logging Out...',
      message: 'Redirecting to Sign In page...'
    });
    setTimeout(() => {
      navigate('/login');
    }, 1200);
  };

  return (
    <div className="space-y-8">
      
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/10 text-brand-500 text-xs font-semibold border border-brand-500/30 mb-2">
          <SettingsIcon className="w-3.5 h-3.5" />
          <span>System Preferences</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Platform Settings & Privacy Controls
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
          Configure notifications, dark theme, security protocols, and language options
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

      {/* 1. Theme Preferences */}
      <div className="glass-panel p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 space-y-4">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 pb-2 border-b border-slate-800 flex items-center gap-2">
          <Sun className="w-4 h-4 text-brand-400" /> Theme & Appearance
        </h3>

        <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
          <div>
            <h4 className="text-sm font-bold text-white">Dark Mode Surface</h4>
            <p className="text-xs text-slate-400">Switch between dark glassmorphism and light medical workspace theme</p>
          </div>

          <button
            onClick={toggleTheme}
            className="px-4 py-2 rounded-xl bg-brand-500 text-white font-bold text-xs flex items-center gap-2 shadow-glow-emerald"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            {theme === 'dark' ? 'Dark Active' : 'Light Active'}
          </button>
        </div>
      </div>

      {/* 2. Notification Preferences */}
      <div className="glass-panel p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 space-y-4">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 pb-2 border-b border-slate-800 flex items-center gap-2">
          <Bell className="w-4 h-4 text-teal-400" /> Notification Channels
        </h3>

        <div className="space-y-3">
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-900/60 border border-slate-800">
            <span className="text-xs font-bold text-white">Email Health Alerts</span>
            <Checkbox
              id="emailAlerts"
              checked={notifications.emailAlerts}
              onChange={(e) => setNotifications({ ...notifications, emailAlerts: e.target.checked })}
            />
          </div>

          <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-900/60 border border-slate-800">
            <span className="text-xs font-bold text-white">Push Notifications for Health Alerts</span>
            <Checkbox
              id="pushNotifications"
              checked={notifications.pushNotifications}
              onChange={(e) => setNotifications({ ...notifications, pushNotifications: e.target.checked })}
            />
          </div>

          <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-900/60 border border-slate-800">
            <span className="text-xs font-bold text-white">Emergency SMS Notifications</span>
            <Checkbox
              id="emergencySMS"
              checked={notifications.emergencySMS}
              onChange={(e) => setNotifications({ ...notifications, emergencySMS: e.target.checked })}
            />
          </div>

          <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-900/60 border border-slate-800">
            <span className="text-xs font-bold text-white">Weekly Health Report</span>
            <Checkbox
              id="weeklyReport"
              checked={notifications.weeklyReport}
              onChange={(e) => setNotifications({ ...notifications, weeklyReport: e.target.checked })}
            />
          </div>
        </div>
      </div>

      {/* 3. Privacy & Security Controls */}
      <div className="glass-panel p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 space-y-4">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 pb-2 border-b border-slate-800 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400" /> HIPAA Security & Privacy
        </h3>

        <div className="space-y-3">
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-900/60 border border-slate-800">
            <span className="text-xs font-bold text-white">Anonymize Data for Analytics</span>
            <Checkbox
              id="anonymizeData"
              checked={privacy.anonymizeData}
              onChange={(e) => setPrivacy({ ...privacy, anonymizeData: e.target.checked })}
            />
          </div>

          <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-900/60 border border-slate-800">
            <span className="text-xs font-bold text-white">Data Encryption Enabled</span>
            <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4" /> Active
            </span>
          </div>

          <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-900/60 border border-slate-800">
            <span className="text-xs font-bold text-white">HIPAA Data Sharing</span>
            <Checkbox
              id="hipaaSharing"
              checked={privacy.hipaaSharing}
              onChange={(e) => setPrivacy({ ...privacy, hipaaSharing: e.target.checked })}
            />
          </div>
        </div>
      </div>

      {/* 4. Language */}
      <div className="glass-panel p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 space-y-4">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 pb-2 border-b border-slate-800 flex items-center gap-2">
          <Globe className="w-4 h-4 text-cyan-400" /> Language
        </h3>

        <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-900/60 border border-slate-800">
          <span className="text-xs font-bold text-white">Preferred Language</span>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            <option>English (US)</option>
            <option>Hindi</option>
            <option>Tamil</option>
            <option>Telugu</option>
            <option>Bengali</option>
          </select>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between pt-4 border-t border-slate-800">
        <Button variant="secondary" icon={LogOut} onClick={handleLogout} className="text-rose-400 border-rose-500/30 hover:bg-rose-500/10">
          Sign Out of Account
        </Button>

        <Button variant="primary" onClick={handleSaveSettings}>
          Save Settings
        </Button>
      </div>

    </div>
  );
};

export default Settings;
