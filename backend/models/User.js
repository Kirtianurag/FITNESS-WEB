const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  gender: { type: String, enum: ['Male', 'Female', 'Other'], required: true },
  age: { type: Number, required: true },
  weight: { type: Number, required: true },
  avatar: { type: String },
  level: { type: Number, default: 1 },
  xp: { type: Number, default: 0 },
  xpToNextLevel: { type: Number, default: 1000 },
  streak: { type: Number, default: 0 },
  lastWorkoutDate: { type: Date },
  fitnessGoals: [String],
  badges: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Achievement' }],
  friends: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  totalCaloriesBurned: { type: Number, default: 0 },
  totalWorkouts: { type: Number, default: 0 },
  completedQuests: [{
    questId: { type: mongoose.Schema.Types.ObjectId, ref: 'Quest' },
    date: { type: Date, default: Date.now }
  }]
}, { timestamps: true });

userSchema.pre('save', async function() {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 10);
});

userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
