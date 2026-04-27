const mongoose = require('mongoose');

const diaryEntrySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    date: {
      type: String, // Format: YYYY-MM-DD
      required: [true, 'Date is required'],
    },
    title: {
      type: String,
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
      default: '',
    },
    content: {
      type: String,
      default: '',
    },
    coverPhoto: {
      type: String,
      default: '',
    },
    mood: {
      type: String,
      enum: ['', '😊', '😢', '😍', '😤', '😴', '🥳', '😰', '🤔', '😌', '🥺'],
      default: '',
    },
    tags: {
      type: [String],
      default: [],
    },
    fontFamily: {
      type: String,
      default: '',
    },
    fontSize: {
      type: Number,
      default: 16,
    },
    backgroundStyle: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

// Compound index: one entry per user per date
diaryEntrySchema.index({ userId: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('DiaryEntry', diaryEntrySchema);
