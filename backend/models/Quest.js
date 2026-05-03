const mongoose = require('mongoose');

const questSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  xpReward: { type: Number, required: true },
  type: { type: String, enum: ['daily', 'weekly', 'boss'], default: 'daily' },
  requirement: {
    type: { type: String }, // e.g., 'calories', 'duration', 'workouts'
    value: { type: Number }
  }
}, { timestamps: true });

module.exports = mongoose.model('Quest', questSchema);
