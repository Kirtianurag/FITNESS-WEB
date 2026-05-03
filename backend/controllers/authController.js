const User = require('../models/User');
const jwt = require('jsonwebtoken');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

exports.register = async (req, res) => {
  const { username, email, password, gender, age, weight } = req.body;
  try {
    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ message: 'User already exists' });

    let avatar;
    if (gender === 'Male') {
      avatar = `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}&topType=ShortHairShortFlat,ShortHairShortRound,ShortHairTheCaesar,ShortHairSides,ShortHairShortWaved&mood[]=happy&backgroundColor=b6e3f4,d1d4f9`;
    } else if (gender === 'Female') {
      avatar = `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}&topType=LongHairBigHair,LongHairBob,LongHairCurly,LongHairCurvy,LongHairStraight,LongHairStraight2&mood[]=happy&backgroundColor=ffdfbf,ffd5dc`;
    } else {
      avatar = `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}&mood[]=happy&backgroundColor=b6e3f4,c0aede,d1d4f9`;
    }
    
    await User.create({ 
      username, 
      email, 
      password, 
      avatar, 
      gender, 
      age, 
      weight 
    });

    res.status(201).json({ message: 'Registration successful' });
  } catch (error) {
    console.error("REGISTRATION ERROR:", error);
    res.status(500).json({ message: error.message });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (user && (await user.comparePassword(password))) {
      res.json({
        _id: user._id,
        username: user.username,
        email: user.email,
        token: generateToken(user._id),
        avatar: user.avatar,
        level: user.level,
        xp: user.xp,
        streak: user.streak,
        xpToNextLevel: user.xpToNextLevel
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    console.error("LOGIN ERROR:", error);
    res.status(500).json({ message: error.message });
  }
};

exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
