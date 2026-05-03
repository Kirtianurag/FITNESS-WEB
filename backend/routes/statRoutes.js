const express = require('express');
const { getGlobalStats, getComparisonStats } = require('../controllers/statController');
const { protect } = require('../middleware/auth');
const router = express.Router();

router.get('/global', protect, getGlobalStats);
router.get('/comparison', protect, getComparisonStats);

module.exports = router;
