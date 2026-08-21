const express = require('express');
const router = express.Router();
const Patient = require('../models/Patient');
const Doctor = require('../models/Doctor');
const Appointment = require('../models/Appointment');
const Invoice = require('../models/Invoice');
const Department = require('../models/Department');
const Medicine = require('../models/Medicine');
const LabTest = require('../models/LabTest');

router.get('/stats', async (req, res) => {
  try {
    const totalPatients = await Patient.countDocuments({ isActive: true });
    const totalDoctors = await Doctor.countDocuments({ isActive: true });
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todayAppointments = await Appointment.countDocuments({
      appointmentDate: { $gte: today, $lt: tomorrow },
    });

    const totalRevenue = await Invoice.aggregate([
      { $match: { paymentStatus: 'paid' } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } },
    ]);

    const pendingAppointments = await Appointment.countDocuments({ status: 'scheduled' });
    const pendingInvoices = await Invoice.countDocuments({ paymentStatus: 'pending' });

    const lowStockMedicines = await Medicine.countDocuments({
      $expr: { $lte: ['$stock', '$lowStockThreshold'] },
      isActive: true,
    });

    const pendingLabTests = await LabTest.countDocuments({ status: 'pending' });

    res.json({
      totalPatients,
      totalDoctors,
      todayAppointments,
      totalRevenue: totalRevenue[0]?.total || 0,
      pendingAppointments,
      pendingInvoices,
      lowStockMedicines,
      pendingLabTests,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/charts/patients-by-department', async (req, res) => {
  try {
    const departments = await Department.find({ isActive: true }).select('name occupiedBeds');
    const data = departments.map((d) => ({ name: d.name, patients: d.occupiedBeds }));
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/charts/appointments-by-status', async (req, res) => {
  try {
    const data = await Appointment.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);
    const formatted = data.map((d) => ({ name: d._id, value: d.count }));
    res.json(formatted);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/charts/monthly-revenue', async (req, res) => {
  try {
    const data = await Invoice.aggregate([
      { $match: { paymentStatus: 'paid' } },
      {
        $group: {
          _id: { $month: '$createdAt' },
          revenue: { $sum: '$totalAmount' },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const formatted = data.map((d) => ({ month: months[d._id - 1], revenue: d.revenue }));
    res.json(formatted);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/recent-appointments', async (req, res) => {
  try {
    const appointments = await Appointment.find()
      .populate('patient', 'firstName lastName')
      .populate('doctor', 'firstName lastName specialization')
      .sort({ appointmentDate: -1 })
      .limit(10);
    res.json(appointments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
