const express = require('express');
const { logWorkout, getWorkouts, getLeaderboard } = require('../controllers/workoutController');
const { protect } = require('../middleware/auth');
const router = express.Router();

router.post('/', protect, logWorkout);
router.get('/', protect, getWorkouts);
router.get('/leaderboard', protect, getLeaderboard);

module.exports = router;
