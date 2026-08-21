const mongoose = require('mongoose');

const medicineSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Medicine name is required'],
      trim: true,
    },
    category: {
      type: String,
      enum: ['antibiotic', 'analgesic', 'antipyretic', 'antihistamine', 'antidiabetic', 'cardiovascular', 'vitamin', 'other'],
      default: 'other',
    },
    manufacturer: {
      type: String,
      default: '',
    },
    dosage: {
      type: String,
      required: true,
    },
    form: {
      type: String,
      enum: ['tablet', 'capsule', 'syrup', 'injection', 'cream', 'drops', 'inhaler', 'powder', 'other'],
      default: 'tablet',
    },
    price: {
      type: Number,
      required: true,
    },
    stock: {
      type: Number,
      required: true,
      default: 0,
    },
    lowStockThreshold: {
      type: Number,
      default: 50,
    },
    expiryDate: {
      type: Date,
      required: true,
    },
    batchNumber: String,
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

medicineSchema.virtual('isLowStock').get(function () {
  return this.stock <= this.lowStockThreshold;
});

medicineSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Medicine', medicineSchema);
