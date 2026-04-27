const { validationResult } = require('express-validator');
const DiaryEntry = require('../models/DiaryEntry');

// @desc    Get all entries for current user
// @route   GET /api/entries
// @access  Private
const getEntries = async (req, res) => {
  try {
    const { month, year, search } = req.query;
    let query = { userId: req.user.id };

    // Filter by month/year
    if (month && year) {
      const monthPadded = String(month).padStart(2, '0');
      query.date = { $regex: `^${year}-${monthPadded}` };
    } else if (year) {
      query.date = { $regex: `^${year}` };
    }

    // Search by title or content
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } },
      ];
    }

    const entries = await DiaryEntry.find(query)
      .sort({ date: -1 })
      .select('date title mood tags createdAt updatedAt');

    res.json({ success: true, count: entries.length, entries });
  } catch (error) {
    console.error('Get entries error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// @desc    Get single entry by date or ID
// @route   GET /api/entries/:id
// @access  Private
const getEntry = async (req, res) => {
  try {
    const entry = await DiaryEntry.findOne({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!entry) {
      return res.status(404).json({ success: false, message: 'Entry not found.' });
    }

    res.json({ success: true, entry });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// @desc    Get entry by date
// @route   GET /api/entries/date/:date
// @access  Private
const getEntryByDate = async (req, res) => {
  try {
    const entry = await DiaryEntry.findOne({
      date: req.params.date,
      userId: req.user.id,
    });

    res.json({ success: true, entry: entry || null });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// @desc    Create a new diary entry
// @route   POST /api/entries
// @access  Private
const createEntry = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  try {
    const { date, title, content, mood, tags, fontFamily, fontSize, backgroundStyle, coverPhoto } = req.body;

    // Check for existing entry on same date
    const existing = await DiaryEntry.findOne({ date, userId: req.user.id });
    if (existing) {
      return res.status(409).json({
        success: false,
        message: 'An entry already exists for this date. Use PUT to update it.',
        entryId: existing._id,
      });
    }

    const entry = await DiaryEntry.create({
      userId: req.user.id,
      date,
      title,
      content,
      mood,
      tags,
      fontFamily,
      fontSize,
      backgroundStyle,
      coverPhoto,
    });

    res.status(201).json({ success: true, message: 'Entry saved! 💖', entry });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ success: false, message: 'Entry already exists for this date.' });
    }
    console.error('Create entry error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// @desc    Update a diary entry
// @route   PUT /api/entries/:id
// @access  Private
const updateEntry = async (req, res) => {
  try {
    const entry = await DiaryEntry.findOne({ _id: req.params.id, userId: req.user.id });

    if (!entry) {
      return res.status(404).json({ success: false, message: 'Entry not found.' });
    }

    const { title, content, mood, tags, fontFamily, fontSize, backgroundStyle, coverPhoto } = req.body;

    entry.title = title !== undefined ? title : entry.title;
    entry.content = content !== undefined ? content : entry.content;
    entry.mood = mood !== undefined ? mood : entry.mood;
    entry.tags = tags !== undefined ? tags : entry.tags;
    entry.fontFamily = fontFamily !== undefined ? fontFamily : entry.fontFamily;
    entry.fontSize = fontSize !== undefined ? fontSize : entry.fontSize;
    entry.backgroundStyle = backgroundStyle !== undefined ? backgroundStyle : entry.backgroundStyle;
    entry.coverPhoto = coverPhoto !== undefined ? coverPhoto : entry.coverPhoto;

    await entry.save();

    res.json({ success: true, message: 'Entry updated! ✨', entry });
  } catch (error) {
    console.error('Update entry error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// @desc    Delete a diary entry
// @route   DELETE /api/entries/:id
// @access  Private
const deleteEntry = async (req, res) => {
  try {
    const entry = await DiaryEntry.findOneAndDelete({ _id: req.params.id, userId: req.user.id });

    if (!entry) {
      return res.status(404).json({ success: false, message: 'Entry not found.' });
    }

    res.json({ success: true, message: 'Entry deleted.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// @desc    Get dates with entries (for calendar highlight)
// @route   GET /api/entries/dates
// @access  Private
const getEntryDates = async (req, res) => {
  try {
    const { month, year } = req.query;
    let query = { userId: req.user.id };

    if (month && year) {
      const monthPadded = String(month).padStart(2, '0');
      query.date = { $regex: `^${year}-${monthPadded}` };
    }

    const entries = await DiaryEntry.find(query).select('date mood -_id');
    res.json({ success: true, entries });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

module.exports = { getEntries, getEntry, getEntryByDate, createEntry, updateEntry, deleteEntry, getEntryDates };
