const express = require('express');
const router = express.Router();
const User = require('../models/User');

// REGISTER
router.post('/register', async (req, res) => {
    try {
        const newUser = new User({ ...req.body, role: 'user', isApproved: false });
        await newUser.save();
        res.status(201).json({ success: true, message: "Registered! Wait for Admin approval." });
    } catch (error) { res.status(400).json({ success: false, message: "Email already exists." }); }
});

// LOGIN
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user || user.password !== password) return res.status(401).json({ message: "Invalid credentials" });
        if (user.role === 'user' && !user.isApproved) return res.status(403).json({ message: "Account pending approval." });
        res.json({ success: true, user });
    } catch (err) { res.status(500).json({ message: err.message }); }
});

// ADMIN: DASHBOARD STATS
router.get('/admin/stats', async (req, res) => {
    const totalUsers = await User.countDocuments({ role: 'user' });
    const pending = await User.countDocuments({ role: 'user', isApproved: false });
    res.json({ totalCommuters: totalUsers, pendingApprovals: pending });
});

// ADMIN: GET USERS
router.get('/admin/users', async (req, res) => {
    const users = await User.find({ role: 'user' });
    res.json(users);
});

// ADMIN: APPROVE USER
router.put('/admin/approve/:id', async (req, res) => {
    await User.findByIdAndUpdate(req.params.id, { isApproved: true });
    res.json({ success: true });
});

// DELETE ACCOUNT (CRUD)
router.delete('/user/:id', async (req, res) => {
    await User.findByIdAndDelete(req.params.id);
    res.json({ success: true });
});

module.exports = router;
