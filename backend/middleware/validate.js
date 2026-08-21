const { body, validationResult } = require('express-validator');

const handleValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: errors.array()[0].msg });
  }
  next();
};

const validateRegister = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
  handleValidation,
];

const validateLogin = [
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('password').notEmpty().withMessage('Password is required'),
  handleValidation,
];

const validateHealthRecord = [
  body('vitals.bpSystolic').optional().isNumeric().withMessage('BP Systolic must be a number'),
  body('vitals.bpDiastolic').optional().isNumeric().withMessage('BP Diastolic must be a number'),
  body('vitals.sugarFasting').optional().isNumeric().withMessage('Sugar must be a number'),
  body('sleepHours').optional().isNumeric().withMessage('Sleep hours must be a number'),
  body('waterIntake').optional().isNumeric().withMessage('Water intake must be a number'),
  handleValidation,
];

module.exports = { validateRegister, validateLogin, validateHealthRecord };
