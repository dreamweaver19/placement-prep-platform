const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const generateToken = (userId) =>
  jwt.sign({ user: { id: userId } }, process.env.JWT_SECRET, { expiresIn: '7d' });

const toSafeUser = (user) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  college: user.college,
  branch: user.branch,
  graduationYear: user.graduationYear,
  targetCompanies: user.targetCompanies || []
});

exports.register = async (req, res) => {
  const { name, email, password, college, branch, graduationYear } = req.body;
  try {
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ msg: 'User already exists' });

    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash(password, salt);

    user = new User({ name, email, password: hashed, college, branch, graduationYear });
    await user.save();

    res.status(201).json({ token: generateToken(user.id), user: toSafeUser(user) });
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ msg: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: 'Invalid credentials' });

    res.json({ token: generateToken(user.id), user: toSafeUser(user) });
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
};

exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
};

exports.updateProfile = async (req, res) => {
  const { name, college, branch, graduationYear, targetCompanies } = req.body;
  try {
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { name, college, branch, graduationYear, targetCompanies },
      { new: true }
    ).select('-password');
    res.json(user);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
};
