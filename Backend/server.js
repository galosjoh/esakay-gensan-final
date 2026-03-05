require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcryptjs = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'esakay_secret_key_2026';

// MIDDLEWARE
app.use(cors({
  origin: 'https://esakay-gensan-gcp.web.app', // Google Cloud URL
  credentials: true
}));
app.use(express.json());

// DATABASE CONNECTION
mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log('✅ MongoDB Connected');
    
    // --- AUTO-SEED ADMIN ACCOUNT ---
    const User = mongoose.model('User');
    const adminExists = await User.findOne({ email: 'admin@esakay.com' });
    if (!adminExists) {
      await User.create({
        name: 'System Administrator',
        email: 'admin@esakay.com',
        mobile: '09000000000',
        password: 'admin12345', // Simple password for demo
        role: 'admin',
        isApproved: true
      });
      console.log('🚀 Admin account created: admin@esakay.com / admin12345');
    }
  })
  .catch(err => console.log('❌ DB Error:', err));

// MODELS
const userSchema = new mongoose.Schema({
  name: String, email: { type: String, unique: true }, mobile: String,
  password: { type: String, required: true }, role: { type: String, default: 'user' },
  isApproved: { type: Boolean, default: false }
});
const User = mongoose.model('User', userSchema);

const fareSchema = new mongoose.Schema({
  userId: String, userName: String, startPoint: String, destination: String, calculatedFare: Number, timestamp: { type: Date, default: Date.now }
});
const Fare = mongoose.model('Fare', fareSchema);

// AUTH ROUTES
app.post('/api/register', async (req, res) => {
  try {
    const newUser = new User(req.body);
    await newUser.save();
    res.status(201).json({ success: true });
  } catch (error) { res.status(400).json({ success: false }); }
});

app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user || user.password !== password) return res.status(401).json({ message: "Invalid credentials" });
  if (user.role === 'user' && !user.isApproved) return res.status(403).json({ message: "Account pending approval." });
  res.json({ success: true, user });
});

// ADMIN ROUTES
app.get('/api/admin/stats', async (req, res) => {
  const totalUsers = await User.countDocuments({ role: 'user' });
  const pending = await User.countDocuments({ role: 'user', isApproved: false });
  res.json({ totalCommuters: totalUsers, pendingApprovals: pending, activeDrivers: 342, activeVehicles: 289 });
});

app.get('/api/admin/users', async (req, res) => {
  const users = await User.find({ role: 'user' });
  res.json(users);
});

app.put('/api/admin/approve/:id', async (req, res) => {
  await User.findByIdAndUpdate(req.params.id, { isApproved: true });
  res.json({ success: true });
});

app.delete('/api/user/:id', async (req, res) => {
  await User.findByIdAndDelete(req.params.id);
  res.json({ success: true });
});

app.post('/api/fare', async (req, res) => {
  const newFare = new Fare(req.body);
  await newFare.save();
  res.json({ success: true });
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
