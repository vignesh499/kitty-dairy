const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: [50, 'Name cannot exceed 50 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false,
    },
    pin: {
      type: String,
      select: false,
    },
    preferences: {
      theme: {
        type: String,
        enum: ['pastel', 'dark', 'floral', 'cute', 'minimal'],
        default: 'pastel',
      },
      backgroundType: {
        type: String,
        enum: ['theme-default', 'color', 'gradient', 'image'],
        default: 'theme-default',
      },
      backgroundColor: {
        type: String,
        default: '#fce4ec',
      },
      backgroundGradient: {
        type: String,
        default: 'linear-gradient(135deg, #fce4ec 0%, #f3e5f5 50%, #e8eaf6 100%)',
      },
      backgroundImage: {
        type: String,
        default: '',
      },
      fontFamily: {
        type: String,
        default: 'Nunito, sans-serif',
      },
      fontSize: {
        type: Number,
        default: 16,
      },
    },
  },
  { timestamps: true }
);

// Hash password before saving
userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
});

// Hash PIN before saving
userSchema.pre('save', async function () {
  if (!this.isModified('pin') || !this.pin) return;
  const salt = await bcrypt.genSalt(10);
  this.pin = await bcrypt.hash(this.pin, salt);
});

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Compare PIN method
userSchema.methods.comparePin = async function (candidatePin) {
  if (!this.pin) return false;
  return bcrypt.compare(candidatePin, this.pin);
};

module.exports = mongoose.model('User', userSchema);
