const HealthProfile = require('../models/HealthProfile');

const getHealthProfile = async (req, res) => {
  try {
    let profile = await HealthProfile.findOne({ user: req.user._id });
    if (!profile) {
      return res.json(null);
    }
    return res.json(profile);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const createHealthProfile = async (req, res) => {
  try {
    const existing = await HealthProfile.findOne({ user: req.user._id });
    if (existing) {
      return res.status(400).json({ message: 'Health profile already exists. Use PUT to update.' });
    }

    const profile = await HealthProfile.create({
      user: req.user._id,
      ...req.body,
    });

    return res.status(201).json(profile);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const updateHealthProfile = async (req, res) => {
  try {
    let profile = await HealthProfile.findOne({ user: req.user._id });
    if (!profile) {
      profile = await HealthProfile.create({
        user: req.user._id,
        ...req.body,
      });
      return res.status(201).json(profile);
    }

    const allowedFields = [
      'dateOfBirth', 'gender', 'height', 'weight', 'bloodGroup',
      'phone', 'address', 'emergencyContact', 'medicalHistory',
      'allergies', 'smokingStatus', 'alcoholStatus', 'targetWeight',
      'dailyWaterGoal', 'dailySleepGoal', 'dailyExerciseGoal',
    ];

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        profile[field] = req.body[field];
      }
    });

    const updated = await profile.save();
    return res.json(updated);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getHealthProfile,
  createHealthProfile,
  updateHealthProfile,
};
