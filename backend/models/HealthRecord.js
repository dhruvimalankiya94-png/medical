const mongoose = require('mongoose');

const healthRecordSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    recordDate: {
      type: Date,
      default: Date.now,
    },
    recordType: {
      type: String,
      default: 'General Checkup',
    },
    type: {
      type: String,
      default: 'General Checkup',
    },
    doctor: {
      type: String,
      default: '',
    },
    vitals: {
      bpSystolic: Number,
      bpDiastolic: Number,
      heartRate: Number,
      temperature: Number,
      oxygenSaturation: Number,
      sugarFasting: Number,
      sugarPostMeal: Number,
      cholesterol: Number,
      cholesterolHDL: Number,
      cholesterolLDL: Number,
    },
    weight: Number,
    height: Number,
    bmi: Number,
    sleepHours: Number,
    waterIntake: Number,
    exerciseMinutes: Number,
    caloriesIntake: Number,
    stepsCount: Number,
    mood: {
      type: String,
      enum: ['great', 'good', 'okay', 'bad', 'terrible'],
    },
    notes: {
      type: String,
      default: '',
    },
    tags: [String],
    status: {
      type: String,
      enum: ['Optimal', 'Good', 'Mild Watch', 'High Risk', 'Recorded'],
      default: 'Recorded',
    },
    pregnancies: { type: Number, default: 0 },
    glucose: { type: Number, default: 0 },
    bloodPressure: { type: Number, default: 0 },
    skinThickness: { type: Number, default: 0 },
    insulin: { type: Number, default: 0 },
    diabetesPedigreeFunction: { type: Number, default: 0 },
    age: { type: Number, default: 0 },
  },
  { timestamps: true }
);

healthRecordSchema.pre('save', function () {
  if (this.height && this.weight) {
    const h = this.height / 100;
    this.bmi = Math.round((this.weight / (h * h)) * 10) / 10;
  }
});

module.exports = mongoose.model('HealthRecord', healthRecordSchema);
