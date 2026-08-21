const mongoose = require('mongoose');

const labTestSchema = new mongoose.Schema(
  {
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Patient',
      required: true,
    },
    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Doctor',
      required: true,
    },
    testType: {
      type: String,
      required: [true, 'Test type is required'],
    },
    testName: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      enum: ['blood', 'urine', 'imaging', 'cardiac', 'hormonal', 'genetic', 'microbiology', 'other'],
      default: 'other',
    },
    status: {
      type: String,
      enum: ['pending', 'in-progress', 'completed', 'cancelled'],
      default: 'pending',
    },
    result: {
      value: String,
      unit: String,
      normalRange: String,
      isAbnormal: {
        type: Boolean,
        default: false,
      },
    },
    notes: String,
    reportFile: String,
    scheduledDate: {
      type: Date,
      required: true,
    },
    completedDate: Date,
    cost: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('LabTest', labTestSchema);
