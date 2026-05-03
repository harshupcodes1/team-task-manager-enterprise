const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

// Check Email (Lightning Fast Validation for Frontend)
router.get('/check-email', async (req, res) => {
  try {
    const { email } = req.query;
    if (!email) return res.json({ exists: false });
    
    // .lean() and .select() make this query extremely fast
    const user = await User.findOne({ email }).select('_id').lean();
    res.json({ exists: !!user });
  } catch (error) {
    res.status(500).json({ message: 'Database query failed. Please check your internet connection.' });
  }
});

// Register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    // Advanced Backend Validation
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Please provide all required fields to create an account.' });
    }
    
    if (password.length < 8) {
      return res.status(400).json({ message: 'Security Policy: Password must be at least 8 characters long.' });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'An account with this corporate email already exists. Please log in.' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    // Force Admin role for specific email
    const assignedRole = email === 'admin@company.com' ? 'ADMIN' : 'MEMBER';

    const user = await User.create({ name, email, password: hashedPassword, role: assignedRole });
    
    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '30d' });
    res.status(201).json({ _id: user._id, name: user.name, email: user.email, role: user.role, token });
  } catch (error) {
    if (error.message && error.message.includes('buffering timed out')) {
      return res.status(503).json({ message: 'Database connection failed. Please check your internet or MongoDB IP whitelist.' });
    }
    res.status(500).json({ message: 'Server error during registration. Please try again later.' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (user && (await bcrypt.compare(password, user.password))) {
      const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '30d' });
      res.json({ _id: user._id, name: user.name, email: user.email, role: user.role, token });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all users (For assigning tasks)
router.get('/users', protect, async (req, res) => {
  try {
    const users = await User.find({}).select('-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete user (Admin only)
router.delete('/users/:id', protect, async (req, res) => {
  try {
    if (req.user.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Access denied: Admins only' });
    }
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    
    await user.deleteOne();
    res.json({ message: 'User removed successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Promote user to ADMIN (Admin only)
router.patch('/users/:id/role', protect, async (req, res) => {
  try {
    if (req.user.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Access denied: Admins only' });
    }
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    
    user.role = 'ADMIN';
    await user.save();
    
    res.json({ message: 'User promoted to ADMIN', user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
