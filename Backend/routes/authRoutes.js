const express = require('express');
const router = express.Router();
const User = require('../models/User');

// LOGIN
router.post('/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ 
        success: false,
        message: 'Email and password required' 
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: 'User not found' 
      });
    }

    if (user.password !== password) {
      return res.status(401).json({ 
        success: false,
        message: 'Wrong password' 
      });
    }

    // Check approval for regular users
    if (user.role === 'user' && !user.isApproved) {
      return res.status(403).json({ 
        success: false,
        message: 'Your account is pending admin approval. Please wait.'
      });
    }

    const token = user._id.toString();

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        mobile: user.mobile,
        isApproved: user.isApproved
      }
    });

  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ 
      success: false,
      message: err.message 
    });
  }
});

// REGISTER
router.post('/auth/register', async (req, res) => {
  try {
    const { name, email, password, mobile, userType } = req.body;

    if (!name || !email || !password || !mobile) {
      return res.status(400).json({ 
        success: false,
        message: 'All fields required' 
      });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ 
        success: false,
        message: 'Email already registered' 
      });
    }

    const newUser = new User({
      name,
      email,
      password,
      mobile,
      role: userType || 'user',
      isApproved: false
    });

    await newUser.save();

    res.status(201).json({
      success: true,
      message: 'Registration successful. Awaiting admin approval.',
      token: newUser._id.toString(),
      user: {
        _id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role
      }
    });

  } catch (error) {
    console.error('Register error:', error);
    res.status(400).json({ 
      success: false,
      message: error.message 
    });
  }
});

// GET ALL USERS (ADMIN)
router.get('/admin/users', async (req, res) => {
  try {
    const users = await User.find({ role: 'user' }).select('-password');
    res.json(users);
  } catch (err) {
    console.error('Error:', err);
    res.status(500).json({ message: err.message });
  }
});

// APPROVE USER (ADMIN)
router.put('/admin/approve/:id', async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isApproved: true },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({ 
      success: true,
      message: 'User approved',
      user 
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// REJECT USER (ADMIN) - NEW
router.put('/admin/reject/:id', async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ 
      success: true,
      message: 'User rejected and deleted' 
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE USER
router.delete('/user/:id', async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'User deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;