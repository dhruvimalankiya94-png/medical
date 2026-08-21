import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, ArrowRight, Loader2 } from 'lucide-react';
import AuthLayout from '../../components/auth/AuthLayout';
import Input from '../../components/common/Input';
import PasswordInput from '../../components/common/PasswordInput';
import Checkbox from '../../components/common/Checkbox';
import Button from '../../components/common/Button';
import Divider from '../../components/common/Divider';
import SocialButton from '../../components/auth/SocialButton';
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

  const handleSocialLogin = (provider) => {
    setAlertState({
      type: 'info',
      title: `${provider} OAuth Initiated`,
      message: `Connecting to ${provider} authentication... Redirecting to dashboard.`
    });
    setTimeout(() => {
      navigate('/dashboard');
    }, 1200);
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
          placeholder="dr.priya@aiims.edu.in"
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

        {/* Social Logins */}
        <Divider label="Or continue with" />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <SocialButton provider="google" onClick={() => handleSocialLogin('Google')} />
          <SocialButton provider="github" onClick={() => handleSocialLogin('GitHub')} />
        </div>

        {/* Footer Link */}
        <p className="text-center text-xs text-slate-500 dark:text-slate-400 pt-4">
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
