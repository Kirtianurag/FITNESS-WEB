const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  receiver: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // for 1-to-1
  room: { type: String }, // for group chat
  content: { type: String, required: true },
  isChallenge: { type: Boolean, default: false },
  challengeDetails: {
    type: { type: String },
    value: { type: Number }
  }
}, { timestamps: true });

module.exports = mongoose.model('Message', messageSchema);
