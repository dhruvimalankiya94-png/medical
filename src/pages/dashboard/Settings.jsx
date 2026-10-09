import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Settings as SettingsIcon, Sun, Moon, Bell, ShieldCheck, LogOut,
  KeyRound, Download, FileJson, Trash2, Loader2, Lock
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import Checkbox from '../../components/common/Checkbox';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Alert from '../../components/common/Alert';
import { authAPI, exportAPI } from '../../services/api';

const PREFERENCE_FIELDS = [
  { key: 'emailAlerts', label: 'Email me when a reading crosses a clinical threshold' },
  { key: 'criticalAlertEmail', label: 'Email me immediately for critical severity alerts' },
  { key: 'weeklyReportEmail', label: 'Email me a weekly health summary' },
];

const PRIVACY_FIELDS = [
  { key: 'anonymizeData', label: 'Anonymise my records when used for aggregate statistics' },
  { key: 'shareWithPhysician', label: 'Allow my records to be shared with an attending physician' },
];

const SectionCard = ({ icon: Icon, iconClass, title, children }) => (
  <div className="glass-panel p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 space-y-4">
    <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 pb-2 border-b border-slate-200 dark:border-slate-800 flex items-center gap-2">
      <Icon className={`w-4 h-4 ${iconClass}`} /> {title}
    </h3>
    {children}
  </div>
);

const Settings = () => {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const { logout, user } = useAuth();
  const [alertState, setAlertState] = useState(null);

  const [prefs, setPrefs] = useState(null);
  const [savingPrefs, setSavingPrefs] = useState(false);

  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [pwErrors, setPwErrors] = useState({});
  const [changingPw, setChangingPw] = useState(false);

  const [exporting, setExporting] = useState(null);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    authAPI
      .getPreferences()
      .then((p) => setPrefs(p || {}))
      .catch(() => setPrefs({}));
  }, []);

  const togglePref = (key) => setPrefs((prev) => ({ ...prev, [key]: !prev?.[key] }));

  const handleSavePreferences = async () => {
    setSavingPrefs(true);
    setAlertState(null);
    try {
      const res = await authAPI.updatePreferences(prefs);
      setPrefs(res.preferences);
      setAlertState({
        type: 'success',
        title: 'Preferences saved',
        message: 'Your notification and privacy preferences are stored on your account.',
      });
    } catch (err) {
      setAlertState({ type: 'error', title: 'Could not save preferences', message: err.message });
    } finally {
      setSavingPrefs(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    const errors = {};
    if (!pwForm.currentPassword) errors.currentPassword = 'Enter your current password';
    if (pwForm.newPassword.length < 8) errors.newPassword = 'Must be at least 8 characters';
    if (pwForm.newPassword !== pwForm.confirmPassword) errors.confirmPassword = 'Passwords do not match';
    setPwErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setChangingPw(true);
    setAlertState(null);
    try {
      await authAPI.changePassword(pwForm.currentPassword, pwForm.newPassword);
      setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setAlertState({
        type: 'success',
        title: 'Password changed',
        message: 'Your password has been updated. Use it the next time you sign in.',
      });
    } catch (err) {
      setAlertState({ type: 'error', title: 'Could not change password', message: err.message });
    } finally {
      setChangingPw(false);
    }
  };

  const handleExport = async (kind) => {
    setExporting(kind);
    setAlertState(null);
    try {
      const filename = kind === 'csv' ? await exportAPI.recordsCsv() : await exportAPI.allJson();
      setAlertState({ type: 'success', title: 'Export downloaded', message: `Saved as ${filename}` });
    } catch (err) {
      setAlertState({ type: 'error', title: 'Export failed', message: err.message });
    } finally {
      setExporting(null);
    }
  };

  const handleDeleteAccount = async () => {
    if (!deletePassword) {
      setAlertState({
        type: 'error',
        title: 'Password required',
        message: 'Enter your password to confirm account deletion.',
      });
      return;
    }
    setDeleting(true);
    try {
      await authAPI.deleteAccount(deletePassword);
      logout();
      navigate('/login', { replace: true });
    } catch (err) {
      setDeleting(false);
      setAlertState({ type: 'error', title: 'Could not delete account', message: err.message });
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
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
          Settings &amp; Privacy Controls
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
          Manage your appearance, notifications, password, data and account
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

      {/* 1. Theme */}
      <SectionCard icon={Sun} iconClass="text-amber-400" title="Theme & Appearance">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-slate-900 dark:text-white">
              {theme === 'dark' ? 'Dark mode' : 'Light mode'}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Your choice is remembered on this device.
            </p>
          </div>
          <button
            type="button"
            onClick={toggleTheme}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            Switch to {theme === 'dark' ? 'light' : 'dark'}
          </button>
        </div>
      </SectionCard>

      {/* 2. Notifications */}
      <SectionCard icon={Bell} iconClass="text-cyan-400" title="Notifications">
        {prefs === null ? (
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Loader2 className="w-4 h-4 animate-spin" /> Loading preferences...
          </div>
        ) : (
          <div className="flex flex-col items-start gap-3">
            {PREFERENCE_FIELDS.map((f) => (
              <Checkbox
                key={f.key}
                id={f.key}
                label={f.label}
                checked={Boolean(prefs[f.key])}
                onChange={() => togglePref(f.key)}
              />
            ))}
            <p className="text-[10px] text-slate-500 dark:text-slate-400 pt-1">
              Email notifications are delivered through the configured SMTP service. When no SMTP
              credentials are set, mail is routed to a capture inbox for demonstration.
            </p>
          </div>
        )}
      </SectionCard>

      {/* 3. Privacy */}
      <SectionCard icon={ShieldCheck} iconClass="text-emerald-400" title="Privacy & Data Sharing">
        {prefs === null ? (
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Loader2 className="w-4 h-4 animate-spin" /> Loading preferences...
          </div>
        ) : (
          <div className="flex flex-col items-start gap-3">
            {PRIVACY_FIELDS.map((f) => (
              <Checkbox
                key={f.key}
                id={f.key}
                label={f.label}
                checked={Boolean(prefs[f.key])}
                onChange={() => togglePref(f.key)}
              />
            ))}

            <div className="mt-2 p-3 rounded-xl bg-slate-100 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
              <p className="text-[11px] font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
                <Lock className="w-3 h-3 text-emerald-500" /> How your credentials are protected
              </p>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                Passwords are stored as bcrypt hashes with a per-user salt and are never saved or
                transmitted in plain text. Password reset links are stored only as a SHA-256 digest
                and expire 15 minutes after they are issued.
              </p>
            </div>
          </div>
        )}
      </SectionCard>

      {prefs !== null && (
        <div className="flex justify-end">
          <Button onClick={handleSavePreferences} disabled={savingPrefs} className="flex items-center gap-2">
            {savingPrefs ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Saving...
              </>
            ) : (
              'Save Preferences'
            )}
          </Button>
        </div>
      )}

      {/* 4. Change password */}
      <SectionCard icon={KeyRound} iconClass="text-violet-400" title="Change Password">
        <form onSubmit={handleChangePassword} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input
              label="Current Password"
              id="currentPassword"
              type="password"
              value={pwForm.currentPassword}
              onChange={(e) => setPwForm({ ...pwForm, currentPassword: e.target.value })}
              error={pwErrors.currentPassword}
              autoComplete="current-password"
            />
            <Input
              label="New Password"
              id="newPassword"
              type="password"
              value={pwForm.newPassword}
              onChange={(e) => setPwForm({ ...pwForm, newPassword: e.target.value })}
              error={pwErrors.newPassword}
              helperText="At least 8 characters"
              autoComplete="new-password"
            />
            <Input
              label="Confirm New Password"
              id="confirmPassword"
              type="password"
              value={pwForm.confirmPassword}
              onChange={(e) => setPwForm({ ...pwForm, confirmPassword: e.target.value })}
              error={pwErrors.confirmPassword}
              autoComplete="new-password"
            />
          </div>
          <div className="flex justify-end">
            <Button type="submit" disabled={changingPw} className="flex items-center gap-2">
              {changingPw ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Updating...
                </>
              ) : (
                'Update Password'
              )}
            </Button>
          </div>
        </form>
      </SectionCard>

      {/* 5. Export */}
      <SectionCard icon={Download} iconClass="text-sky-400" title="Export My Data">
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Download a copy of your health data in an open format. The JSON export contains everything
          the system holds about your account.
        </p>
        <div className="flex flex-wrap gap-3">
          <Button variant="outline" onClick={() => handleExport('csv')} disabled={exporting !== null} className="flex items-center gap-2">
            {exporting === 'csv' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
            Health Records (CSV)
          </Button>
          <Button variant="outline" onClick={() => handleExport('json')} disabled={exporting !== null} className="flex items-center gap-2">
            {exporting === 'json' ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileJson className="w-4 h-4" />}
            Full Account Data (JSON)
          </Button>
        </div>
      </SectionCard>

      {/* 6. Session */}
      <SectionCard icon={LogOut} iconClass="text-slate-400" title="Session">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-slate-900 dark:text-white">
              Signed in as {user?.email || 'your account'}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Signing out clears your session token from this browser.
            </p>
          </div>
          <Button variant="secondary" onClick={handleLogout} className="flex items-center gap-2 shrink-0">
            <LogOut className="w-4 h-4" /> Sign Out
          </Button>
        </div>
      </SectionCard>

      {/* 7. Danger zone */}
      <div className="glass-panel p-6 rounded-3xl border border-rose-500/40 bg-rose-500/5 space-y-4">
        <h3 className="text-sm font-bold uppercase tracking-wider text-rose-500 pb-2 border-b border-rose-500/20 flex items-center gap-2">
          <Trash2 className="w-4 h-4" /> Delete Account
        </h3>
        <p className="text-xs text-slate-600 dark:text-slate-300">
          This permanently removes your account, health records, daily tasks, risk assessment history
          and health profile. It cannot be undone. Export your data first if you want to keep a copy.
        </p>

        {!deleteOpen ? (
          <Button variant="outline" onClick={() => setDeleteOpen(true)} className="!border-rose-500/60 !text-rose-500 hover:!bg-rose-500/10">
            Delete my account
          </Button>
        ) : (
          <div className="space-y-3">
            <Input
              label="Confirm your password"
              id="deletePassword"
              type="password"
              value={deletePassword}
              onChange={(e) => setDeletePassword(e.target.value)}
              autoComplete="current-password"
            />
            <div className="flex flex-wrap gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  setDeleteOpen(false);
                  setDeletePassword('');
                }}
                disabled={deleting}
              >
                Cancel
              </Button>
              <Button
                onClick={handleDeleteAccount}
                disabled={deleting}
                className="!bg-rose-500 hover:!bg-rose-600 !from-rose-500 !to-rose-600 flex items-center gap-2"
              >
                {deleting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Deleting...
                  </>
                ) : (
                  'Permanently delete'
                )}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Settings;
