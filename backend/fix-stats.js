const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const Workout = require('./models/Workout');

dotenv.config();

const fixStats = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/fitness-gamified');
    console.log('MongoDB connected for fixing stats...');

    const users = await User.find();

    for (let user of users) {
      const workouts = await Workout.find({ user: user._id });
      let totalCalories = 0;
      let totalWorkouts = workouts.length;

      workouts.forEach(w => {
        totalCalories += Number(w.calories);
      });

      user.totalCaloriesBurned = totalCalories;
      user.totalWorkouts = totalWorkouts;
      await user.save();
      console.log(`Updated stats for user: ${user.username} | Total Calories: ${totalCalories} | Total Workouts: ${totalWorkouts}`);
    }

    console.log('All user stats fixed successfully!');
    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

fixStats();
