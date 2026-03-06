const express = require('express');
const router = express.Router();
const User = require('../models/User');

// --- LOGIN ---
router.post('/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        
        if (!user) {
            return res.status(404).json({ message: "Email not found." });
        }
        
        if (user.password !== password) {
            return res.status(401).json({ message: "Wrong password." });
        }
        
        // Check if user is approved (only for regular users, not admins)
        if (user.role === 'user' && !user.isApproved) {
            return res.status(403).json({ message: "Your account is pending approval." });
        }
        
        // Generate a simple token (use JWT in production)
        const token = user._id.toString();
        
        res.json({ 
            success: true, 
            token,
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                isApproved: user.isApproved,
                mobile: user.mobile
            }
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// --- REGISTER ---
router.post('/auth/register', async (req, res) => {
    try {
        const { name, email, password, mobile, userType } = req.body;
        
        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "Email already registered." });
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
            token: newUser._id.toString(),
            user: {
                _id: newUser._id,
                name: newUser.name,
                email: newUser.email,
                role: newUser.role
            }
        });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// --- GET ALL USERS (ADMIN ONLY) ---
router.get('/admin/users', async (req, res) => {
    try {
        // In production, verify the token here
        const users = await User.find({ role: 'user' });
        res.json(users);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// --- APPROVE USER (ADMIN ONLY) ---
router.put('/admin/approve/:id', async (req, res) => {
    try {
        const user = await User.findByIdAndUpdate(
            req.params.id,
            { isApproved: true },
            { new: true }
        );
        res.json({ success: true, user });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// --- DELETE USER ---
router.delete('/user/:id', async (req, res) => {
    try {
        await User.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: "User deleted" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
