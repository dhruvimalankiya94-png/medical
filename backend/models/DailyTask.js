const mongoose = require('mongoose');

const dailyTaskSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      enum: ['exercise', 'water', 'medicine', 'walking', 'sleep', 'diet', 'other'],
      default: 'other',
    },
    targetValue: {
      type: Number,
      default: 1,
    },
    currentValue: {
      type: Number,
      default: 0,
    },
    unit: {
      type: String,
      default: '',
    },
    completed: {
      type: Boolean,
      default: false,
    },
    taskDate: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

dailyTaskSchema.index({ user: 1, taskDate: 1 });

module.exports = mongoose.model('DailyTask', dailyTaskSchema);
