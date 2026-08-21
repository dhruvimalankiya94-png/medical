const mongoose = require('mongoose');

const healthProfileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    dateOfBirth: {
      type: Date,
      required: [true, 'Date of birth is required'],
    },
    gender: {
      type: String,
      enum: ['male', 'female', 'other'],
      required: true,
    },
    height: {
      type: Number,
      required: true,
    },
    weight: {
      type: Number,
      required: true,
    },
    bloodGroup: {
      type: String,
      enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
    },
    phone: {
      type: String,
      default: '',
    },
    address: {
      type: String,
      default: '',
    },
    emergencyContact: {
      name: { type: String, default: '' },
      phone: { type: String, default: '' },
      relation: { type: String, default: '' },
    },
    medicalHistory: [
      {
        condition: String,
        diagnosedDate: Date,
        status: {
          type: String,
          enum: ['active', 'resolved', 'chronic'],
          default: 'active',
        },
      },
    ],
    allergies: [String],
    smokingStatus: {
      type: String,
      enum: ['never', 'former', 'current'],
      default: 'never',
    },
    alcoholStatus: {
      type: String,
      enum: ['never', 'occasional', 'regular'],
      default: 'never',
    },
    targetWeight: Number,
    dailyWaterGoal: {
      type: Number,
      default: 3.0,
    },
    dailySleepGoal: {
      type: Number,
      default: 8,
    },
    dailyExerciseGoal: {
      type: Number,
      default: 45,
    },
  },
  { timestamps: true }
);

healthProfileSchema.virtual('age').get(function () {
  if (!this.dateOfBirth) return 0;
  const diff = Date.now() - this.dateOfBirth.getTime();
  return Math.floor(diff / (365.25 * 24 * 60 * 60 * 1000));
});

healthProfileSchema.virtual('bmi').get(function () {
  if (!this.height || !this.weight) return 0;
  const heightInMeters = this.height / 100;
  return Math.round((this.weight / (heightInMeters * heightInMeters)) * 10) / 10;
});

healthProfileSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('HealthProfile', healthProfileSchema);
