const express = require('express');
const { body } = require('express-validator');
const {
  getEntries,
  getEntry,
  getEntryByDate,
  createEntry,
  updateEntry,
  deleteEntry,
  getEntryDates,
} = require('../controllers/entriesController');
const { protect } = require('../middleware/auth');

const router = express.Router();

const entryValidation = [
  body('date')
    .notEmpty()
    .withMessage('Date is required')
    .matches(/^\d{4}-\d{2}-\d{2}$/)
    .withMessage('Date must be in YYYY-MM-DD format'),
];

// All routes are protected
router.use(protect);

router.get('/dates', getEntryDates);
router.get('/date/:date', getEntryByDate);
router.get('/', getEntries);
router.get('/:id', getEntry);
router.post('/', entryValidation, createEntry);
router.put('/:id', updateEntry);
router.delete('/:id', deleteEntry);

module.exports = router;
