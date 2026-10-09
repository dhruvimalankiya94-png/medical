import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, ArrowRight, Loader2, UserCheck, ShieldCheck } from 'lucide-react';
import AuthLayout from '../../components/auth/AuthLayout';
import Input from '../../components/common/Input';
import PasswordInput from '../../components/common/PasswordInput';
import Checkbox from '../../components/common/Checkbox';
import Button from '../../components/common/Button';
import Divider from '../../components/common/Divider';
import Alert from '../../components/common/Alert';
import { useAuth } from '../../context/AuthContext';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [alertState, setAlertState] = useState(null);

  const validate = () => {
    const errs = {};
    if (!formData.email) errs.email = 'Email address is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) errs.email = 'Enter a valid email address';

    if (!formData.password) errs.password = 'Password is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const fillDemoAccount = (email, password) => {
    setFormData((prev) => ({
      ...prev,
      email,
      password,
    }));
    setErrors({});
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setAlertState(null);

    try {
      await login(formData.email, formData.password);
      setLoading(false);
      setAlertState({
        type: 'success',
        title: 'Sign In Successful!',
        message: 'Redirecting to your Smart Healthcare Analytics Dashboard...'
      });
      setTimeout(() => {
        navigate('/dashboard');
      }, 1000);
    } catch (error) {
      setLoading(false);
      setAlertState({
        type: 'error',
        title: 'Authentication Failed',
        message: error.message || 'Invalid credentials. Please verify your email and password.'
      });
    }
  };

  return (
    <AuthLayout
      title="Welcome Back"
      subtitle="Sign in to access your health dashboard"
    >
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        {alertState && (
          <Alert
            type={alertState.type}
            title={alertState.title}
            message={alertState.message}
            onClose={() => setAlertState(null)}
          />
        )}

        {/* Email Field */}
        <Input
          label="Email Address"
          id="email"
          type="email"
          icon={Mail}
          placeholder="rahul.sharma@email.com"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          error={errors.email}
          required
        />

        {/* Password Field */}
        <PasswordInput
          label="Password"
          id="password"
          placeholder="••••••••"
          value={formData.password}
          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          error={errors.password}
          required
        />

        {/* Remember Me & Forgot Password */}
        <div className="flex items-center justify-between pt-1">
          <Checkbox
            id="rememberMe"
            label="Remember me"
            checked={formData.rememberMe}
            onChange={(e) => setFormData({ ...formData, rememberMe: e.target.checked })}
          />

          <Link
            to="/forgot-password"
            className="text-xs font-semibold text-brand-600 dark:text-brand-400 hover:underline"
          >
            Forgot password?
          </Link>
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          variant="primary"
          size="lg"
          className="w-full mt-2"
          disabled={loading}
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              Authenticating...
            </span>
          ) : (
            <span className="flex items-center gap-2">
              Sign In to Account <ArrowRight className="w-4 h-4" />
            </span>
          )}
        </Button>

        {/* Testing Perspective - MongoDB Demo Accounts */}
        <div className="pt-2">
          <Divider label="Testing & Evaluation Perspective" />
          <div className="mt-3 p-3.5 rounded-xl bg-slate-900/60 dark:bg-slate-900/80 border border-slate-700/60 text-xs">
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold text-slate-200 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                Demo Accounts (Saved in MongoDB)
              </span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-brand-500/20 text-brand-400 border border-brand-500/30">
                1-Click Fill
              </span>
            </div>
            <p className="text-slate-400 mb-3 text-[11px] leading-relaxed">
              Use these pre-seeded test accounts to explore patient health records, clinical analytics, and admin dashboard:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => fillDemoAccount('rahul.sharma@email.com', 'Password123!')}
                className="flex items-center justify-between p-2.5 rounded-lg bg-slate-800/80 hover:bg-slate-800 border border-slate-700 hover:border-brand-500/60 transition-all text-left group cursor-pointer"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <UserCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span className="font-medium text-slate-200 group-hover:text-brand-400 truncate text-[12px]">
                      Rahul Sharma
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono block mt-0.5 truncate">
                    rahul.sharma@email.com
                  </span>
                </div>
                <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shrink-0 ml-1">
                  Patient
                </span>
              </button>

              <button
                type="button"
                onClick={() => fillDemoAccount('admin@healthpulse.com', 'Admin123!')}
                className="flex items-center justify-between p-2.5 rounded-lg bg-slate-800/80 hover:bg-slate-800 border border-slate-700 hover:border-brand-500/60 transition-all text-left group cursor-pointer"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                    <span className="font-medium text-slate-200 group-hover:text-brand-400 truncate text-[12px]">
                      Admin User
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono block mt-0.5 truncate">
                    admin@healthpulse.com
                  </span>
                </div>
                <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-purple-500/10 text-purple-400 border border-purple-500/20 shrink-0 ml-1">
                  Admin
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer Link */}
        <p className="text-center text-xs text-slate-500 dark:text-slate-400 pt-3">
          Don't have an account?{' '}
          <Link to="/register" className="font-bold text-brand-600 dark:text-brand-400 hover:underline">
            Create an Account
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
};

export default Login;
