const User = require('../models/User');

// Login Logic
exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    // Check sa Database
    const user = await User.findOne({ email });
    
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (user.password !== password) return res.status(401).json({ message: 'Wrong password' });

    res.status(200).json({ message: 'Success', user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Register Logic (Para makagawa ka ng user)
exports.registerUser = async (req, res) => {
  try {
    const { email, password, name } = req.body;
    const newUser = new User({ email, password, name });
    await newUser.save();
    res.status(201).json({ message: "User Created!", user: newUser });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};