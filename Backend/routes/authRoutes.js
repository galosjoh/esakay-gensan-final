const express = require('express');
const router = express.Router();
const User = require('../models/User');

// LOGIN Route
router.post('/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({ 
        success: false,
        message: 'Email and password are required' 
      });
    }

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: 'Email not found' 
      });
    }

    // Check password
    if (user.password !== password) {
      return res.status(401).json({ 
        success: false,
        message: 'Incorrect password' 
      });
    }

    // Check if approved (for regular users)
    if (user.role === 'user' && !user.isApproved) {
      return res.status(403).json({ 
        success: false,
        message: 'Your account is pending admin approval' 
      });
    }

    // Generate token (in production, use JWT)
    const token = user._id.toString();

    res.json({
      success: true,
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

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
});

// REGISTER Route
router.post('/auth/register', async (req, res) => {
  try {
    const { name, email, password, mobile, userType } = req.body;

    // Validation
    if (!name || !email || !password || !mobile) {
      return res.status(400).json({ 
        success: false,
        message: 'All fields are required' 
      });
    }

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ 
        success: false,
        message: 'Email already registered' 
      });
    }

    // Create new user
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
      message: 'Registration successful. Please wait for admin approval.',
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

// GET ALL USERS (Admin Only)
router.get('/admin/users', async (req, res) => {
  try {
    const users = await User.find({ role: 'user' }).select('-password');
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
});

// APPROVE USER (Admin Only)
router.put('/admin/approve/:id', async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isApproved: true, updatedAt: new Date() },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: 'User not found' 
      });
    }

    res.json({ 
      success: true,
      message: 'User approved successfully',
      user 
    });

  } catch (error) {
    console.error('Approval error:', error);
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
});

// DELETE USER
router.delete('/user/:id', async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);

    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: 'User not found' 
      });
    }

    res.json({ 
      success: true,
      message: 'User deleted successfully' 
    });

  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
});

module.exports = router;