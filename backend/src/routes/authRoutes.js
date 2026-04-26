const express = require('express');
const { body } = require('express-validator');
const {
  signup,
  login,
  getMe,
  updatePreferences,
  setPin,
  verifyPin,
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Validation rules
const signupValidation = [
  body('name').trim().notEmpty().withMessage('Name is required').isLength({ max: 50 }),
  body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
];

const loginValidation = [
  body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required'),
];

router.post('/signup', signupValidation, signup);
router.post('/login', loginValidation, login);
router.get('/me', protect, getMe);
router.put('/preferences', protect, updatePreferences);
router.put('/pin', protect, setPin);
router.post('/verify-pin', protect, verifyPin);

module.exports = router;
