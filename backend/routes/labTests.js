const express = require('express');
const router = express.Router();
const LabTest = require('../models/LabTest');

router.get('/', async (req, res) => {
  try {
    const { status, patient, category, page = 1, limit = 20 } = req.query;
    let query = {};

    if (status) query.status = status;
    if (patient) query.patient = patient;
    if (category) query.category = category;

    const labTests = await LabTest.find(query)
      .populate('patient', 'firstName lastName email phone')
      .populate('doctor', 'firstName lastName specialization')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await LabTest.countDocuments(query);

    res.json({ labTests, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const labTest = await LabTest.findById(req.params.id)
      .populate('patient', 'firstName lastName email phone')
      .populate('doctor', 'firstName lastName specialization');
    if (!labTest) return res.status(404).json({ message: 'Lab test not found' });
    res.json(labTest);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const labTest = await LabTest.create(req.body);
    res.status(201).json(labTest);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const labTest = await LabTest.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!labTest) return res.status(404).json({ message: 'Lab test not found' });
    res.json(labTest);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;
