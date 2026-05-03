const express = require('express');
const { getAllUsers, getMessages, saveMessage, updateXP, updateProfile } = require('../controllers/userController');
const { protect } = require('../middleware/auth');
const router = express.Router();

router.get('/', protect, getAllUsers);
router.get('/messages/:recipientId', protect, getMessages);
router.post('/messages', protect, saveMessage);
router.post('/xp-update', protect, updateXP);
router.put('/profile', protect, updateProfile);

module.exports = router;
