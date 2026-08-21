const HealthRecord = require('../models/HealthRecord');
const PredictionHistory = require('../models/PredictionHistory');
const { predictDiabetesRisk } = require('../services/mlService');

// @desc    Create a new health record & run ML Diabetes Risk Assessment
// @route   POST /api/records
// @access  Private
const createHealthRecord = async (req, res) => {
  try {
    const {
      pregnancies,
      glucose,
      bloodPressure,
      skinThickness,
      insulin,
      bmi,
      diabetesPedigreeFunction,
      age,
      type,
      doctor,
      notes,
      vitals,
    } = req.body;

    const bpSystolic = vitals?.bpSystolic || bloodPressure || 0;
    const bpDiastolic = vitals?.bpDiastolic || bloodPressure || 0;

    if (glucose === undefined || bloodPressure === undefined || bmi === undefined || age === undefined) {
      return res.status(400).json({
        message: 'Missing required clinical fields: glucose, bloodPressure, bmi, age are required.',
      });
    }

    // 1. Save HealthRecord in MongoDB
    const record = await HealthRecord.create({
      user: req.user._id,
      recordType: type || 'General Checkup',
      type: type || 'General Checkup',
      doctor: doctor || '',
      vitals: {
        bpSystolic: bpSystolic,
        bpDiastolic: bpDiastolic,
        sugarFasting: glucose || undefined,
      },
      pregnancies: pregnancies || 0,
      glucose,
      bloodPressure,
      skinThickness: skinThickness || 0,
      insulin: insulin || 0,
      bmi,
      diabetesPedigreeFunction: diabetesPedigreeFunction || 0,
      age,
      notes: notes || '',
      status: 'Recorded',
    });

    // 2. Invoke Python FastAPI ML Service
    let mlResult;
    try {
      mlResult = await predictDiabetesRisk({
        pregnancies: record.pregnancies,
        glucose: record.glucose,
        bloodPressure: record.bloodPressure,
        skinThickness: record.skinThickness,
        insulin: record.insulin,
        bmi: record.bmi,
        diabetesPedigreeFunction: record.diabetesPedigreeFunction,
        age: record.age,
      });
    } catch (mlError) {
      return res.status(201).json({
        success: true,
        message: 'Health record saved successfully, but ML Service was unavailable.',
        record,
        mlServiceError: mlError.message,
      });
    }

    // 3. Update HealthRecord status based on ML prediction
    record.status = mlResult.risk_level === 'High Risk' ? 'High Risk' : (mlResult.risk_level === 'Moderate Risk' ? 'Mild Watch' : 'Optimal');
    await record.save();

    // 4. Save PredictionHistory in MongoDB
    const predictionHistory = await PredictionHistory.create({
      user: req.user._id,
      healthRecord: record._id,
      inputs: {
        pregnancies: record.pregnancies,
        glucose: record.glucose,
        bloodPressure: record.bloodPressure,
        skinThickness: record.skinThickness,
        insulin: record.insulin,
        bmi: record.bmi,
        diabetesPedigreeFunction: record.diabetesPedigreeFunction,
        age: record.age,
      },
      prediction: mlResult.prediction,
      riskProbability: mlResult.risk_probability,
      riskPercentage: mlResult.risk_percentage,
      riskLevel: mlResult.risk_level,
      keyContributingFactors: mlResult.key_contributing_factors || [],
      modelUsed: mlResult.model_used,
      disclaimer: mlResult.disclaimer,
    });

    return res.status(201).json({
      success: true,
      message: 'Health record created & ML diabetes risk assessment generated',
      record,
      assessment: {
        assessmentId: predictionHistory._id,
        prediction: mlResult.prediction,
        riskProbability: mlResult.risk_probability,
        riskPercentage: mlResult.risk_percentage,
        riskLevel: mlResult.risk_level,
        keyContributingFactors: mlResult.key_contributing_factors,
        modelUsed: mlResult.model_used,
        disclaimer: mlResult.disclaimer,
        timestamp: predictionHistory.timestamp,
      },
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// @desc    Get user's health records
// @route   GET /api/records?page=1&limit=20&search=&status=
// @access  Private
const getHealthRecords = async (req, res) => {
  try {
    const filter = req.user.role === 'admin' || req.user.role === 'doctor' ? {} : { user: req.user._id };

    if (req.query.status && req.query.status !== 'All') {
      filter.status = req.query.status;
    }

    if (req.query.search) {
      const s = req.query.search.toLowerCase();
      filter.$or = [
        { type: { $regex: s, $options: 'i' } },
        { recordType: { $regex: s, $options: 'i' } },
        { doctor: { $regex: s, $options: 'i' } },
        { notes: { $regex: s, $options: 'i' } },
      ];
    }

    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 20));
    const skip = (page - 1) * limit;

    const total = await HealthRecord.countDocuments(filter);
    const records = await HealthRecord.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    return res.json({
      records,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// @desc    Get single health record by ID
// @route   GET /api/records/:id
// @access  Private
const getHealthRecordById = async (req, res) => {
  try {
    const record = await HealthRecord.findById(req.params.id);
    if (!record) {
      return res.status(404).json({ message: 'Health record not found' });
    }

    if (record.user.toString() !== req.user._id.toString() && req.user.role !== 'admin' && req.user.role !== 'doctor') {
      return res.status(403).json({ message: 'Not authorized to access this record' });
    }

    return res.json(record);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// @desc    Update health record
// @route   PUT /api/records/:id
// @access  Private
const updateHealthRecord = async (req, res) => {
  try {
    const record = await HealthRecord.findById(req.params.id);
    if (!record) {
      return res.status(404).json({ message: 'Health record not found' });
    }

    if (record.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to update this record' });
    }

    Object.assign(record, req.body);
    const updatedRecord = await record.save();
    return res.json(updatedRecord);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// @desc    Delete health record
// @route   DELETE /api/records/:id
// @access  Private
const deleteHealthRecord = async (req, res) => {
  try {
    const record = await HealthRecord.findById(req.params.id);
    if (!record) {
      return res.status(404).json({ message: 'Health record not found' });
    }

    if (record.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this record' });
    }

    await record.deleteOne();
    await PredictionHistory.deleteMany({ healthRecord: req.params.id });

    return res.json({ message: 'Health record and associated prediction history deleted successfully' });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createHealthRecord,
  getHealthRecords,
  getHealthRecordById,
  updateHealthRecord,
  deleteHealthRecord,
};
