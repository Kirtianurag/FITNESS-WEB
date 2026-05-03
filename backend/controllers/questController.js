const Quest = require('../models/Quest');

exports.getQuests = async (req, res) => {
  try {
    const quests = await Quest.find();
    res.json(quests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
