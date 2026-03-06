const express = require('express');
const router = express.Router();
const User = require('../models/User');

// REGISTER
router.post('/register', async (req, res) => {
    try {
        const newUser = new User(req.body); // name, email, password, mobile
        await newUser.save();
        res.status(201).json({ success: true });
    } catch (error) { res.status(400).json({ success: false, message: "Email used." }); }
});

// LOGIN (MAHALAGA: Dito tinitingnan ang Role at Approval)
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });

        if (!user || user.password !== password) {
            return res.status(401).json({ message: "Mali ang email o password." });
        }

        // Kung USER at hindi pa APPROVED
        if (user.role === 'user' && !user.isApproved) {
            return res.status(403).json({ message: "Pending Approval: Hintayin ang approval ni Admin." });
        }

        res.json({ success: true, user });
    } catch (err) { res.status(500).json({ message: err.message }); }
});

// ADMIN: GET ALL USERS PARA SA TABLE
router.get('/admin/users', async (req, res) => {
    try {
        const users = await User.find({ role: 'user' });
        res.json(users);
    } catch (err) { res.status(500).json(err); }
});

// ADMIN: APPROVE USER
router.put('/admin/approve/:id', async (req, res) => {
    await User.findByIdAndUpdate(req.params.id, { isApproved: true });
    res.json({ success: true });
});

// CRUD: DELETE USER
router.delete('/user/:id', async (req, res) => {
    await User.findByIdAndDelete(req.params.id);
    res.json({ success: true });
});

module.exports = router;
