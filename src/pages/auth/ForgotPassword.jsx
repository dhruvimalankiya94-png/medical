import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { authAPI } from '../../services/api';
import { Mail, ArrowRight, CheckCircle2, Loader2 } from 'lucide-react';
import AuthLayout from '../../components/auth/AuthLayout';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import Alert from '../../components/common/Alert';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  // Only populated when the backend is running without SMTP credentials and has
  // delivered the mail to a capture inbox. The reset token itself is never sent
  // to the browser; it exists only inside the emailed link.
  const [previewUrl, setPreviewUrl] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      setError('Email address is required');
      return;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const res = await authAPI.forgotPassword(email);
      setPreviewUrl(res.previewUrl || '');
      setIsSubmitted(true);
    } catch (err) {
      setError(err.message || 'Failed to send reset link');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title={isSubmitted ? 'Check Your Email' : 'Reset Your Password'}
      subtitle={
        isSubmitted
          ? `We have dispatched a password recovery link to ${email}`
          : 'Enter your registered email to receive a password reset link'
      }
      backLink="/login"
    >
      {isSubmitted ? (
        <div className="text-center py-6 space-y-6">
          <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto shadow-glow-emerald animate-pulse">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <Alert
            type="success"
            title="Password Reset Link Sent"
            message="If an account exists for that address, a reset link is on its way. The link expires in 15 minutes and can only be used once. Check your spam folder if it has not arrived in 2 minutes."
          />

          <div className="pt-2 space-y-3">
            {previewUrl && (
              <a href={previewUrl} target="_blank" rel="noopener noreferrer" className="block">
                <Button variant="primary" size="md" className="w-full">
                  Open the reset email <ArrowRight className="w-4 h-4" />
                </Button>
                <span className="block text-[10px] text-slate-500 dark:text-slate-400 mt-2">
                  No SMTP account is configured, so the message was delivered to a capture inbox.
                  This button opens it so the reset flow can be demonstrated locally.
                </span>
              </a>
            )}

            <Link to="/login" className="block text-xs font-bold text-slate-500 hover:text-brand-400">
              Return to Sign In
            </Link>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5" noValidate>
          <Input
            label="Registered Email Address"
            id="forgot-email"
            type="email"
            icon={Mail}
            placeholder="doctor@hospital.com"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setError('');
            }}
            error={error}
            required
          />

          <Button
            type="submit"
            variant="primary"
            size="lg"
            className="w-full"
            disabled={loading}
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                Dispatching Reset Link...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                Send Reset Link <ArrowRight className="w-4 h-4" />
              </span>
            )}
          </Button>

          <p className="text-center text-xs text-slate-500 dark:text-slate-400 pt-2">
            Remembered your password?{' '}
            <Link to="/login" className="font-bold text-brand-600 dark:text-brand-400 hover:underline">
              Back to Sign In
            </Link>
          </p>
        </form>
      )}
    </AuthLayout>
  );
};

export default ForgotPassword;
