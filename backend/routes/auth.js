const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const User = require('../models/User');
const HealthRecord = require('../models/HealthRecord');
const DailyTask = require('../models/DailyTask');
const PredictionHistory = require('../models/PredictionHistory');
const HealthProfile = require('../models/HealthProfile');
const { validateRegister, validateLogin } = require('../middleware/validate');
const { authLimiter, sensitiveActionLimiter } = require('../middleware/rateLimit');
const upload = require('../middleware/upload');
const { sendPasswordResetEmail } = require('../services/emailService');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const path = require('path');
const fs = require('fs');

const RESET_EXPIRY_MINUTES = 15;

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE });
};

router.post('/register', authLimiter, validateRegister, async (req, res) => {
  try {
    const { name, email, password, role, phone } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const user = await User.create({ name, email, password, role, phone });
    const token = generateToken(user._id);

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/login', authLimiter, validateLogin, async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password' });
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = generateToken(user._id);

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/me', protect, async (req, res) => {
  res.json(req.user);
});

router.put('/update-profile', protect, async (req, res) => {
  try {
    const { name, phone, avatar } = req.body;
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    if (name !== undefined) user.name = name;
    if (phone !== undefined) user.phone = phone;
    if (avatar !== undefined) user.avatar = avatar;
    const updated = await user.save();
    res.json({
      _id: updated._id,
      name: updated.name,
      email: updated.email,
      role: updated.role,
      phone: updated.phone,
      avatar: updated.avatar,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/upload-avatar', protect, upload.single('avatar'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Please upload an image file' });
    }
    const avatarUrl = `/uploads/avatars/${req.file.filename}`;
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    user.avatar = avatarUrl;
    await user.save({ validateBeforeSave: false });
    res.json({ avatar: avatarUrl });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Only the SHA-256 digest of a reset token is stored, so a leaked database
// snapshot cannot be used to take over accounts. The raw token exists only in
// the emailed link.
const hashResetToken = (raw) => crypto.createHash('sha256').update(raw).digest('hex');

router.post('/forgot-password', authLimiter, async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: 'Please provide your email' });
    }

    const user = await User.findOne({ email });
    // Always answer the same way so the endpoint cannot be used to discover
    // which email addresses are registered.
    const genericMessage = 'If an account exists with this email, a password reset link has been sent';
    if (!user) {
      return res.json({ message: genericMessage });
    }

    const rawToken = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = hashResetToken(rawToken);
    user.resetPasswordExpire = Date.now() + RESET_EXPIRY_MINUTES * 60 * 1000;
    await user.save({ validateBeforeSave: false });

    const clientUrl = process.env.CLIENT_URL || 'http://localhost:3000';
    const resetUrl = `${clientUrl}/reset-password?token=${rawToken}`;

    try {
      const result = await sendPasswordResetEmail({
        to: user.email,
        name: user.name,
        resetUrl,
        expiryMinutes: RESET_EXPIRY_MINUTES,
      });

      return res.json({
        message: genericMessage,
        emailDelivery: result.mode,
        // Ethereal capture mode only: lets the reset mail be opened during a
        // local demo. Never present when real SMTP credentials are configured.
        ...(result.previewUrl ? { previewUrl: result.previewUrl } : {}),
      });
    } catch (mailError) {
      // Do not leave a usable token behind if the mail never went out.
      user.resetPasswordToken = null;
      user.resetPasswordExpire = null;
      await user.save({ validateBeforeSave: false });
      console.error('Password reset email failed:', mailError.message);
      return res.status(502).json({
        message: 'Could not send the password reset email. Please try again later.',
      });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/reset-password', authLimiter, async (req, res) => {
  try {
    const { resetToken, newPassword } = req.body;
    if (!resetToken || !newPassword) {
      return res.status(400).json({ message: 'Reset token and new password are required' });
    }
    if (newPassword.length < 8) {
      return res.status(400).json({ message: 'Password must be at least 8 characters' });
    }
    const user = await User.findOne({
      resetPasswordToken: hashResetToken(resetToken),
      resetPasswordExpire: { $gt: Date.now() },
    });
    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired reset token' });
    }
    user.password = newPassword;
    user.resetPasswordToken = null;
    user.resetPasswordExpire = null;
    await user.save();
    res.json({ message: 'Password reset successful' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Read the signed-in user's account preferences
// @route   GET /api/auth/preferences
// @access  Private
router.get('/preferences', protect, async (req, res) => {
  // Mongoose fills in the schema defaults, so this is always a complete object.
  res.json(req.user.preferences || {});
});

// @desc    Update the signed-in user's account preferences
// @route   PUT /api/auth/preferences
// @access  Private
router.put('/preferences', protect, async (req, res) => {
  try {
    const ALLOWED = [
      'emailAlerts',
      'weeklyReportEmail',
      'criticalAlertEmail',
      'anonymizeData',
      'shareWithPhysician',
    ];

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    for (const key of ALLOWED) {
      if (req.body[key] !== undefined) {
        user.preferences[key] = Boolean(req.body[key]);
      }
    }

    await user.save({ validateBeforeSave: false });
    res.json({ message: 'Preferences saved', preferences: user.preferences });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Change the password of the signed-in user
// @route   PUT /api/auth/change-password
// @access  Private
router.put('/change-password', protect, sensitiveActionLimiter, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Current password and new password are required' });
    }
    if (newPassword.length < 8) {
      return res.status(400).json({ message: 'New password must be at least 8 characters' });
    }
    if (currentPassword === newPassword) {
      return res.status(400).json({ message: 'New password must be different from the current password' });
    }

    const user = await User.findById(req.user._id).select('+password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({ message: 'Current password is incorrect' });
    }

    user.password = newPassword;
    // Invalidate any outstanding reset link now that the password changed.
    user.resetPasswordToken = null;
    user.resetPasswordExpire = null;
    await user.save();

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Permanently delete the signed-in user's account and all their data
// @route   DELETE /api/auth/me
// @access  Private
router.delete('/me', protect, sensitiveActionLimiter, async (req, res) => {
  try {
    const { password } = req.body || {};
    if (!password) {
      return res.status(400).json({ message: 'Password confirmation is required to delete your account' });
    }

    const user = await User.findById(req.user._id).select('+password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Password is incorrect' });
    }

    const userId = user._id;
    const [records, tasks, predictions, profiles] = await Promise.all([
      HealthRecord.deleteMany({ user: userId }),
      DailyTask.deleteMany({ user: userId }),
      PredictionHistory.deleteMany({ user: userId }),
      HealthProfile.deleteMany({ user: userId }),
    ]);

    // Remove the uploaded avatar from disk so no orphan files are left behind.
    if (user.avatar && user.avatar.startsWith('/uploads/avatars/')) {
      const avatarPath = path.join(__dirname, '..', user.avatar.replace(/^\//, ''));
      await fs.promises.unlink(avatarPath).catch(() => {});
    }

    await user.deleteOne();

    res.json({
      message: 'Account and all associated data permanently deleted',
      deleted: {
        healthRecords: records.deletedCount,
        dailyTasks: tasks.deletedCount,
        predictionHistory: predictions.deletedCount,
        healthProfiles: profiles.deletedCount,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
