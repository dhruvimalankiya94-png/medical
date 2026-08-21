const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema(
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
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Department',
    },
    appointmentDate: {
      type: Date,
      required: [true, 'Appointment date is required'],
    },
    appointmentTime: {
      type: String,
      required: [true, 'Appointment time is required'],
    },
    status: {
      type: String,
      enum: ['scheduled', 'confirmed', 'in-progress', 'completed', 'cancelled', 'no-show'],
      default: 'scheduled',
    },
    type: {
      type: String,
      enum: ['consultation', 'follow-up', 'emergency', 'routine-checkup'],
      default: 'consultation',
    },
    reason: {
      type: String,
      required: true,
    },
    notes: String,
    prescription: [
      {
        medicine: String,
        dosage: String,
        frequency: String,
        duration: String,
      },
    ],
    followUpDate: Date,
  },
  { timestamps: true }
);

module.exports = mongoose.model('Appointment', appointmentSchema);
