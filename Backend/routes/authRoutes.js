const express = require('express');
const router = express.Router();
const User = require('../models/User');

router.post('/register', async (req, res) => {
    try {
        const newUser = new User(req.body);
        await newUser.save();
        res.status(201).json({ success: true });
    } catch (error) { res.status(400).json({ success: false }); }
});

router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user || user.password !== password) return res.status(401).json({ message: "Invalid credentials" });
        if (user.role === 'user' && !user.isApproved) return res.status(403).json({ message: "Wait for Admin approval." });
        res.json({ success: true, user });
    } catch (err) { res.status(500).json({ message: err.message }); }
});

router.get('/admin/users', async (req, res) => {
    const users = await User.find({ role: 'user' });
    res.json(users);
});

router.put('/admin/approve/:id', async (req, res) => {
    await User.findByIdAndUpdate(req.params.id, { isApproved: true });
    res.json({ success: true });
});

router.delete('/user/:id', async (req, res) => {
    await User.findByIdAndDelete(req.params.id);
    res.json({ success: true });
});

module.exports = router;