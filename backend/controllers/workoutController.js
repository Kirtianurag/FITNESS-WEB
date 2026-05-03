const Workout = require('../models/Workout');
const User = require('../models/User');

exports.logWorkout = async (req, res) => {
  const { type } = req.body;
  const duration = Number(req.body.duration);
  const calories = Number(req.body.calories);
  try {
    // Basic XP calculation: duration * 2 + calories / 10
    const xpGained = Math.round(duration * 2 + calories / 10);
    
    const workout = await Workout.create({
      user: req.user.id,
      type,
      duration,
      calories,
      xpGained
    });

    const user = await User.findById(req.user.id);
    user.xp += xpGained;
    user.totalCaloriesBurned += calories;
    user.totalWorkouts += 1;

    // Level up logic
    while (user.xp >= user.xpToNextLevel) {
      user.xp -= user.xpToNextLevel;
      user.level += 1;
      user.xpToNextLevel = Math.round(user.xpToNextLevel * 1.2); // Increase difficulty
    }

    // Streak logic (simplified)
    const today = new Date().setHours(0,0,0,0);
    if (!user.lastWorkoutDate || new Date(user.lastWorkoutDate).setHours(0,0,0,0) < today) {
      if (user.lastWorkoutDate && (today - new Date(user.lastWorkoutDate).setHours(0,0,0,0)) <= 86400000) {
        user.streak += 1;
      } else {
        user.streak = 1;
      }
      user.lastWorkoutDate = new Date();
    }

    await user.save();

    res.status(201).json({ 
      workout, 
      user: { 
        xp: user.xp, 
        level: user.level, 
        streak: user.streak, 
        xpToNextLevel: user.xpToNextLevel,
        totalCaloriesBurned: user.totalCaloriesBurned,
        totalWorkouts: user.totalWorkouts
      } 
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getWorkouts = async (req, res) => {
  try {
    const workouts = await Workout.find({ user: req.user.id }).sort({ date: -1 });
    res.json(workouts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getLeaderboard = async (req, res) => {
  try {
    const leaderboard = await User.find()
      .sort({ level: -1, xp: -1 })
      .limit(10)
      .select('username avatar level xp');
    res.json(leaderboard);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
