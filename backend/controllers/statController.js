const User = require('../models/User');
const Workout = require('../models/Workout');

exports.getGlobalStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const aggregateWorkouts = await Workout.aggregate([
      { $group: { _id: null, totalCalories: { $sum: "$calories" }, totalCount: { $sum: 1 } } }
    ]);

    const stats = {
      totalUsers,
      totalCalories: aggregateWorkouts[0]?.totalCalories || 0,
      totalWorkouts: aggregateWorkouts[0]?.totalCount || 0
    };

    res.json(stats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getComparisonStats = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const allUsers = await User.find().select('xp');
    
    const avgXp = allUsers.reduce((sum, u) => sum + u.xp, 0) / allUsers.length;
    const eliteXp = Math.max(...allUsers.map(u => u.xp));

    res.json({
      yourXp: user.xp,
      avgXp: Math.round(avgXp),
      eliteXp: eliteXp,
      yourLevel: user.level
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
