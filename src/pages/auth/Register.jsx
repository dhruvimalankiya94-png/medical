import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  User, Mail, Phone, Calendar, Upload, 
  ArrowRight, Loader2, Camera, ShieldCheck 
} from 'lucide-react';
import AuthLayout from '../../components/auth/AuthLayout';
import Input from '../../components/common/Input';
import PasswordInput from '../../components/common/PasswordInput';
import Checkbox from '../../components/common/Checkbox';
import Button from '../../components/common/Button';
import Alert from '../../components/common/Alert';
import { useAuth } from '../../context/AuthContext';

const Register = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [avatarPreview, setAvatarPreview] = useState(null);
  
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    gender: 'male',
    dob: '',
    agreeTerms: false
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [alertState, setAlertState] = useState(null);

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const validate = () => {
    const errs = {};
    if (!formData.fullName.trim()) errs.fullName = 'Full Name is required';
    if (!formData.email) {
      errs.email = 'Email address is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errs.email = 'Enter a valid email format';
    }
    if (!formData.phone.trim()) errs.phone = 'Phone number is required';
    if (!formData.password) {
      errs.password = 'Password is required';
    } else if (formData.password.length < 6) {
      errs.password = 'Password must be at least 6 characters';
    }
    if (formData.password !== formData.confirmPassword) {
      errs.confirmPassword = 'Passwords do not match';
    }
    if (!formData.dob) errs.dob = 'Date of Birth is required';
    if (!formData.agreeTerms) errs.agreeTerms = 'You must agree to the Terms of Service';

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setAlertState(null);

    try {
      await register({
        name: formData.fullName,
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
        role: 'patient'
      });

      setLoading(false);
      setAlertState({
        type: 'success',
        title: 'Account Created Successfully!',
        message: 'Redirecting to sign-in page...'
      });
      setTimeout(() => {
        navigate('/login');
      }, 1200);
    } catch (error) {
      setLoading(false);
      setAlertState({
        type: 'error',
        title: 'Registration Failed',
        message: error.message || 'Failed to create account. Please check your information.'
      });
    }
  };

  return (
    <AuthLayout
      title="Create Your Account"
      subtitle="Join HealthPulse - Your Personal Health Analytics Platform"
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

        {/* Profile Avatar Upload Dropzone */}
        <div className="flex flex-col items-center justify-center text-center py-2">
          <div className="relative group cursor-pointer">
            <div className="w-20 h-20 rounded-full bg-slate-100 dark:bg-slate-800 border-2 border-dashed border-brand-500/50 flex items-center justify-center overflow-hidden shadow-inner">
              {avatarPreview ? (
                <img src={avatarPreview} alt="Avatar Preview" className="w-full h-full object-cover" />
              ) : (
                <User className="w-8 h-8 text-slate-400 group-hover:text-brand-400 transition-colors" />
              )}
            </div>
            <label
              htmlFor="avatar-upload"
              className="absolute bottom-0 right-0 p-1.5 rounded-full bg-brand-500 text-white shadow-md hover:bg-brand-600 cursor-pointer transition-transform group-hover:scale-110"
            >
              <Camera className="w-3.5 h-3.5" />
            </label>
            <input
              id="avatar-upload"
              type="file"
              accept="image/*"
              className="sr-only"
              onChange={handleAvatarChange}
            />
          </div>
          <span className="text-[11px] font-semibold text-slate-400 mt-1">
            Upload Profile Picture (Optional)
          </span>
        </div>

        {/* Full Name */}
        <Input
          label="Full Name"
          id="fullName"
          icon={User}
          placeholder="e.g. Rahul Sharma"
          value={formData.fullName}
          onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
          error={errors.fullName}
          required
        />

        {/* Email & Phone side-by-side on sm screens */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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

          <Input
            label="Phone Number"
            id="phone"
            type="tel"
            icon={Phone}
            placeholder="+91 98765 43210"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            error={errors.phone}
            required
          />
        </div>

        {/* Gender Select & Date of Birth */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              Gender <span className="text-rose-500">*</span>
            </label>
            <select
              value={formData.gender}
              onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
              className="w-full py-2.5 px-3.5 text-sm rounded-xl bg-white/70 dark:bg-slate-900/80 border border-slate-300/80 dark:border-slate-800/80 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/30"
            >
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other / Non-Binary</option>
            </select>
          </div>

          <Input
            label="Date of Birth"
            id="dob"
            type="date"
            icon={Calendar}
            value={formData.dob}
            onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
            error={errors.dob}
            required
          />
        </div>

        {/* Password & Confirm Password */}
        <PasswordInput
          label="Password"
          id="password"
          placeholder="At least 8 characters"
          value={formData.password}
          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          error={errors.password}
          showStrengthMeter
          required
        />

        <PasswordInput
          label="Confirm Password"
          id="confirmPassword"
          placeholder="Repeat password"
          value={formData.confirmPassword}
          onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
          error={errors.confirmPassword}
          required
        />

        {/* Terms & Conditions Checkbox */}
        <div className="pt-1">
          <Checkbox
            id="agreeTerms"
            label="I agree to HIPAA Compliance & Terms of Service"
            checked={formData.agreeTerms}
            onChange={(e) => setFormData({ ...formData, agreeTerms: e.target.checked })}
          />
          {errors.agreeTerms && (
            <p className="text-xs text-rose-500 font-medium mt-1">{errors.agreeTerms}</p>
          )}
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          variant="primary"
          size="lg"
          className="w-full mt-3"
          disabled={loading}
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              Creating Account...
            </span>
          ) : (
            <span className="flex items-center gap-2">
              Create Free Account <ArrowRight className="w-4 h-4" />
            </span>
          )}
        </Button>

        {/* Footer Link */}
        <p className="text-center text-xs text-slate-500 dark:text-slate-400 pt-3">
          Already have an account?{' '}
          <Link to="/login" className="font-bold text-brand-600 dark:text-brand-400 hover:underline">
            Sign In Here
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
};

export default Register;
