const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      // No `minlength` here on purpose: the pre-save hook below replaces this
      // value with a 60 character bcrypt hash before Mongoose runs validators,
      // so a length validator on this path would only ever measure the hash.
      // The plaintext rule is enforced in the hook instead.
      select: false,
    },
    role: {
      type: String,
      enum: ['admin', 'doctor', 'nurse', 'staff', 'patient'],
      default: 'patient',
    },
    phone: {
      type: String,
      default: '',
    },
    avatar: {
      type: String,
      default: '',
    },
    resetPasswordToken: {
      type: String,
      default: null,
      select: false,
    },
    resetPasswordExpire: {
      type: Date,
      default: null,
      select: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    // Account preferences. Stored on the user so they follow the account across
    // browsers and devices, rather than living only in one browser's storage.
    preferences: {
      emailAlerts: { type: Boolean, default: true },
      weeklyReportEmail: { type: Boolean, default: true },
      criticalAlertEmail: { type: Boolean, default: true },
      anonymizeData: { type: Boolean, default: false },
      shareWithPhysician: { type: Boolean, default: false },
    },
  },
  { timestamps: true }
);

const MIN_PASSWORD_LENGTH = 8;

userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;

  // Enforced here rather than as a schema validator, because this hook runs
  // before validation and would otherwise hand the validator a hash.
  if (typeof this.password !== 'string' || this.password.length < MIN_PASSWORD_LENGTH) {
    throw new Error(`Password must be at least ${MIN_PASSWORD_LENGTH} characters`);
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
