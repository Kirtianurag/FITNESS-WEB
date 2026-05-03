const User = require('../models/User');
const Message = require('../models/Message');

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find({ _id: { $ne: req.user.id } }).select('username avatar level streak');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getMessages = async (req, res) => {
  const { recipientId } = req.params;
  const room = [req.user.id, recipientId].sort().join('_');
  try {
    const messages = await Message.find({ room }).sort({ createdAt: 1 });
    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.saveMessage = async (req, res) => {
  const { recipientId, content, room } = req.body;
  try {
    const message = await Message.create({
      sender: req.user.id,
      receiver: recipientId,
      room,
      content
    });
    res.status(201).json(message);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateXP = async (req, res) => {
  const { xpToAdd } = req.body;
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.xp += xpToAdd;
    
    // Simple level up logic: every 1000 XP is a level
    const newLevel = Math.floor(user.xp / 1000) + 1;
    user.level = newLevel;

    await user.save();
    res.json({ xp: user.xp, level: user.level });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const { username, email, age, weight, gender, bio, height, fitnessGoals } = req.body;
    const user = await User.findById(req.user.id);
    
    if (username) user.username = username;
    if (email) user.email = email;
    if (age) user.age = age;
    if (weight) user.weight = weight;
    if (gender) user.gender = gender;
    if (bio !== undefined) user.bio = bio;
    if (height) user.height = height;
    if (fitnessGoals) user.fitnessGoals = fitnessGoals;

    await user.save();
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
