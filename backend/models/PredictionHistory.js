const mongoose = require('mongoose');

const predictionHistorySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    healthRecord: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'HealthRecord',
      required: true,
    },
    inputs: {
      pregnancies: Number,
      glucose: Number,
      bloodPressure: Number,
      skinThickness: Number,
      insulin: Number,
      bmi: Number,
      diabetesPedigreeFunction: Number,
      age: Number,
    },
    prediction: {
      type: Number,
      required: true,
    },
    riskProbability: {
      type: Number,
      required: true,
    },
    riskPercentage: {
      type: Number,
      required: true,
    },
    riskLevel: {
      type: String,
      required: true,
    },
    keyContributingFactors: [
      {
        type: String,
      },
    ],
    modelUsed: {
      type: String,
      default: 'RandomForestClassifier (Pima Indians Dataset)',
    },
    disclaimer: {
      type: String,
      required: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// The risk-assessment history page lists a user's predictions newest first.
predictionHistorySchema.index({ user: 1, createdAt: -1 });
// deleteHealthRecord cascades by healthRecord id.
predictionHistorySchema.index({ healthRecord: 1 });

module.exports = mongoose.model('PredictionHistory', predictionHistorySchema);
