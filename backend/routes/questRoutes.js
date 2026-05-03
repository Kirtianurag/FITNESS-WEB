const express = require('express');
const { getQuests } = require('../controllers/questController');
const { protect } = require('../middleware/auth');
const User = require('../models/User');
const Quest = require('../models/Quest');
const router = express.Router();

router.get('/', protect, getQuests);

router.post('/claim/:id', protect, async (req, res) => {
  try {
    const quest = await Quest.findById(req.params.id);
    const user = await User.findById(req.user.id);
    
    if (!quest) return res.status(404).json({ message: "Quest not found" });

    // Check if already completed today
    const today = new Date().setHours(0,0,0,0);
    const alreadyClaimed = (user.completedQuests || []).some(cq => 
      cq.questId && cq.questId.toString() === quest._id.toString() && 
      new Date(cq.date).setHours(0,0,0,0) === today
    );

    if (alreadyClaimed) {
      return res.status(400).json({ message: "Quest already claimed today!" });
    }

    // Add XP and record completion
    user.xp += quest.xpReward;
    user.completedQuests.push({ questId: quest._id, date: new Date() });
    
    // Level up logic
    const newLevel = Math.floor(user.xp / 1000) + 1;
    user.level = newLevel;

    await user.save();
    res.json({ message: "XP Claimed!", xp: user.xp, level: user.level, user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
