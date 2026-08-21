import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { User, Loader2, Save, Mail, Phone, MapPin, Heart, Calendar, Camera } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { healthProfileAPI, authAPI } from '../../services/api';
import Alert from '../../components/common/Alert';

const Profile = () => {
  const { user, login } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [alertState, setAlertState] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    dateOfBirth: '',
    gender: 'male',
    height: '',
    weight: '',
    bloodGroup: 'O+',
    address: '',
    emergencyContactName: '',
    emergencyContactPhone: '',
    emergencyContactRelation: '',
    allergies: '',
    smokingStatus: 'never',
    alcoholStatus: 'never',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const hp = await healthProfileAPI.get().catch(() => null);
      setProfile(hp);
      setFormData({
        name: user?.name || '',
        phone: user?.phone || hp?.phone || '',
        dateOfBirth: hp?.dateOfBirth ? new Date(hp.dateOfBirth).toISOString().split('T')[0] : '',
        gender: hp?.gender || 'male',
        height: hp?.height || '',
        weight: hp?.weight || '',
        bloodGroup: hp?.bloodGroup || 'O+',
        address: hp?.address || '',
        emergencyContactName: hp?.emergencyContact?.name || '',
        emergencyContactPhone: hp?.emergencyContact?.phone || '',
        emergencyContactRelation: hp?.emergencyContact?.relation || '',
        allergies: (hp?.allergies || []).join(', '),
        smokingStatus: hp?.smokingStatus || 'never',
        alcoholStatus: hp?.alcoholStatus || 'never',
      });
    } catch (err) {
      setAlertState({ type: 'error', title: 'Error', message: 'Failed to load profile' });
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      setAlertState({ type: 'error', title: 'File Too Large', message: 'Maximum file size is 2MB' });
      return;
    }

    const preview = URL.createObjectURL(file);
    setAvatarPreview(preview);

    setUploading(true);
    try {
      const result = await authAPI.uploadAvatar(file);
      const updatedUser = { ...user, avatar: result.avatar };
      localStorage.setItem('healthcare_user', JSON.stringify(updatedUser));
      login(updatedUser);
      setAlertState({ type: 'success', title: 'Success', message: 'Profile photo updated' });
    } catch (err) {
      setAvatarPreview(null);
      setAlertState({ type: 'error', title: 'Upload Failed', message: err.message });
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (formData.name !== user?.name) {
        await authAPI.updateProfile({ name: formData.name, phone: formData.phone });
      }

      const profileData = {
        dateOfBirth: formData.dateOfBirth || undefined,
        gender: formData.gender,
        height: Number(formData.height) || undefined,
        weight: Number(formData.weight) || undefined,
        bloodGroup: formData.bloodGroup,
        phone: formData.phone,
        address: formData.address,
        emergencyContact: {
          name: formData.emergencyContactName,
          phone: formData.emergencyContactPhone,
          relation: formData.emergencyContactRelation,
        },
        allergies: formData.allergies ? formData.allergies.split(',').map((a) => a.trim()).filter(Boolean) : [],
        smokingStatus: formData.smokingStatus,
        alcoholStatus: formData.alcoholStatus,
      };

      await healthProfileAPI.update(profileData);
      setAlertState({ type: 'success', title: 'Success', message: 'Profile updated successfully' });
      setEditMode(false);
      fetchData();
    } catch (err) {
      setAlertState({ type: 'error', title: 'Error', message: err.message });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center py-24"><Loader2 className="w-6 h-6 animate-spin text-brand-500" /></div>;
  }

  const bmi = formData.height && formData.weight
    ? (formData.weight / ((formData.height / 100) ** 2)).toFixed(1) : '--';

  const age = formData.dateOfBirth
    ? Math.floor((Date.now() - new Date(formData.dateOfBirth).getTime()) / (365.25 * 24 * 60 * 60 * 1000)) : '--';

  const displayAvatar = avatarPreview || user?.avatar;

  return (
    <div className="space-y-8">
      {alertState && <Alert type={alertState.type} title={alertState.title} message={alertState.message} onClose={() => setAlertState(null)} />}

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/10 text-brand-500 text-xs font-semibold border border-brand-500/30 mb-2">
            <User className="w-3.5 h-3.5" />
            <span>My Profile</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">Health Profile</h1>
        </div>
        <div className="flex gap-2">
          {editMode ? (
            <>
              <button onClick={() => setEditMode(false)} className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all">Cancel</button>
              <button onClick={handleSave} disabled={saving} className="px-4 py-2 rounded-xl bg-brand-500 hover:bg-brand-600 disabled:opacity-50 text-white text-xs font-bold flex items-center gap-2 transition-all">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Save Changes
              </button>
            </>
          ) : (
            <button onClick={() => setEditMode(true)} className="px-4 py-2 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-xs font-bold transition-all">Edit Profile</button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-panel p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 text-center space-y-3">
          <div className="relative w-24 h-24 mx-auto group">
            {displayAvatar ? (
              <img src={displayAvatar} alt="Profile" className="w-24 h-24 rounded-full object-cover border-2 border-brand-500" />
            ) : (
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-brand-500 to-cyan-400 flex items-center justify-center text-white text-3xl font-black">
                {(formData.name || 'U').charAt(0).toUpperCase()}
              </div>
            )}
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity disabled:cursor-not-allowed"
            >
              {uploading ? (
                <Loader2 className="w-5 h-5 text-white animate-spin" />
              ) : (
                <Camera className="w-5 h-5 text-white" />
              )}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/webp"
              onChange={handleAvatarChange}
              className="hidden"
            />
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">{formData.name || 'User'}</h3>
          <p className="text-xs text-slate-400">{user?.email}</p>
          <div className="flex justify-center gap-4 pt-2">
            <div className="text-center">
              <p className="text-lg font-black text-brand-500">{bmi}</p>
              <p className="text-[9px] text-slate-400">BMI</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-black text-cyan-500">{age}</p>
              <p className="text-[9px] text-slate-400">Age</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-black text-amber-500">{formData.bloodGroup}</p>
              <p className="text-[9px] text-slate-400">Blood</p>
            </div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="lg:col-span-2 glass-panel p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 space-y-5">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-800 pb-3">Personal Information</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-slate-500 mb-1">Full Name</label>
              {editMode ? (
                <input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:outline-none" />
              ) : (
                <p className="text-xs font-semibold text-slate-900 dark:text-white">{formData.name || '-'}</p>
              )}
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-500 mb-1">Phone</label>
              {editMode ? (
                <input value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:outline-none" />
              ) : (
                <p className="text-xs font-semibold text-slate-900 dark:text-white">{formData.phone || '-'}</p>
              )}
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-500 mb-1">Date of Birth</label>
              {editMode ? (
                <input type="date" value={formData.dateOfBirth} onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })} className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:outline-none" />
              ) : (
                <p className="text-xs font-semibold text-slate-900 dark:text-white">{formData.dateOfBirth || '-'}</p>
              )}
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-500 mb-1">Gender</label>
              {editMode ? (
                <select value={formData.gender} onChange={(e) => setFormData({ ...formData, gender: e.target.value })} className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:outline-none">
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              ) : (
                <p className="text-xs font-semibold text-slate-900 dark:text-white capitalize">{formData.gender}</p>
              )}
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-500 mb-1">Height (cm)</label>
              {editMode ? (
                <input type="number" value={formData.height} onChange={(e) => setFormData({ ...formData, height: e.target.value })} className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:outline-none" />
              ) : (
                <p className="text-xs font-semibold text-slate-900 dark:text-white">{formData.height ? `${formData.height} cm` : '-'}</p>
              )}
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-500 mb-1">Weight (kg)</label>
              {editMode ? (
                <input type="number" value={formData.weight} onChange={(e) => setFormData({ ...formData, weight: e.target.value })} className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:outline-none" />
              ) : (
                <p className="text-xs font-semibold text-slate-900 dark:text-white">{formData.weight ? `${formData.weight} kg` : '-'}</p>
              )}
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-500 mb-1">Blood Group</label>
              {editMode ? (
                <select value={formData.bloodGroup} onChange={(e) => setFormData({ ...formData, bloodGroup: e.target.value })} className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:outline-none">
                  {['A+','A-','B+','B-','AB+','AB-','O+','O-'].map((bg) => <option key={bg} value={bg}>{bg}</option>)}
                </select>
              ) : (
                <p className="text-xs font-semibold text-slate-900 dark:text-white">{formData.bloodGroup}</p>
              )}
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-500 mb-1">Allergies</label>
              {editMode ? (
                <input value={formData.allergies} onChange={(e) => setFormData({ ...formData, allergies: e.target.value })} placeholder="e.g. Dust, Peanuts" className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:outline-none" />
              ) : (
                <p className="text-xs font-semibold text-slate-900 dark:text-white">{formData.allergies || 'None'}</p>
              )}
            </div>
          </div>

          <h3 className="text-sm font-bold text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-800 pb-3 pt-2">Emergency Contact</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-slate-500 mb-1">Name</label>
              {editMode ? (
                <input value={formData.emergencyContactName} onChange={(e) => setFormData({ ...formData, emergencyContactName: e.target.value })} className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:outline-none" />
              ) : (
                <p className="text-xs font-semibold text-slate-900 dark:text-white">{formData.emergencyContactName || '-'}</p>
              )}
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-500 mb-1">Phone</label>
              {editMode ? (
                <input value={formData.emergencyContactPhone} onChange={(e) => setFormData({ ...formData, emergencyContactPhone: e.target.value })} className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:outline-none" />
              ) : (
                <p className="text-xs font-semibold text-slate-900 dark:text-white">{formData.emergencyContactPhone || '-'}</p>
              )}
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-500 mb-1">Relation</label>
              {editMode ? (
                <input value={formData.emergencyContactRelation} onChange={(e) => setFormData({ ...formData, emergencyContactRelation: e.target.value })} className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:outline-none" />
              ) : (
                <p className="text-xs font-semibold text-slate-900 dark:text-white">{formData.emergencyContactRelation || '-'}</p>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Profile;
