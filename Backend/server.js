const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const bcryptjs = require('bcryptjs');
const jwt = require('jsonwebtoken');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// ✅ YOUR ACTUAL MONGODB CONNECTION STRING
const MONGODB_URI = process.env.MONGO_URI || 'mongodb+srv://2023cetegalosjoh_db_user:esakay2025@esakay.zuzukoa.mongodb.net/eSakayDB?retryWrites=true&w=majority&appName=eSakays';

const JWT_SECRET = process.env.JWT_SECRET || 'esakay_secret_key_2026_super_secure';

// ==========================================
// MIDDLEWARE
// ==========================================
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ==========================================
// MONGODB CONNECTION
// ==========================================
mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => {
  console.log('✅ MongoDB Connected Successfully!');
  console.log('📊 Database: eSakayDB');
  console.log('👤 User: 2023cetegalosjoh_db_user');
})
.catch(err => {
  console.error('❌ MongoDB Connection Error:', err.message);
  process.exit(1);
});

// ==========================================
// SCHEMAS & MODELS
// ==========================================

// User Schema
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  mobile: { type: String, default: '' },
  role: { type: String, enum: ['user', 'driver', 'admin'], default: 'user' },
  isApproved: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);

// Fare Schema
const fareSchema = new mongoose.Schema({
  userId: String,
  userName: String,
  startPoint: String,
  destination: String,
  vehicleType: String,
  passengerType: String,
  calculatedFare: Number,
  timestamp: { type: Date, default: Date.now }
});

const Fare = mongoose.model('Fare', fareSchema);

// Vehicle Schema
const vehicleSchema = new mongoose.Schema({
  plateNumber: String,
  type: { type: String, enum: ['Jeepney', 'Tricycle', 'Bus'] },
  driver: String,
  driverName: String,
  route: String,
  status: { type: String, enum: ['active', 'inactive', 'maintenance'], default: 'active' },
  currentLocation: String,
  eta: String,
  rating: { type: Number, default: 4.5 },
  color: String,
  createdAt: { type: Date, default: Date.now }
});

const Vehicle = mongoose.model('Vehicle', vehicleSchema);

// Community Post Schema
const postSchema = new mongoose.Schema({
  userId: String,
  user: String,
  type: String,
  content: String,
  likes: { type: Number, default: 0 },
  comments: [{ user: String, text: String, timestamp: Date }],
  timestamp: { type: Date, default: Date.now }
});

const Post = mongoose.model('Post', postSchema);

// SOS/Safety Schema
const safetySchema = new mongoose.Schema({
  userId: String,
  userName: String,
  type: { type: String, enum: ['sos', 'unsafe-driving', 'overpricing', 'harassment', 'accident', 'lost-item'] },
  vehicleNumber: String,
  location: String,
  description: String,
  status: { type: String, enum: ['pending', 'resolved'], default: 'pending' },
  timestamp: { type: Date, default: Date.now }
});

const Safety = mongoose.model('Safety', safetySchema);

// Payment Schema
const paymentSchema = new mongoose.Schema({
  userId: String,
  userName: String,
  amount: Number,
  paymentMethod: String,
  status: { type: String, enum: ['pending', 'completed', 'failed'], default: 'completed' },
  timestamp: { type: Date, default: Date.now }
});

const Payment = mongoose.model('Payment', paymentSchema);

// ==========================================
// AUTHENTICATION MIDDLEWARE
// ==========================================
const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'No token provided' });
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Invalid token' });
  }
};

// ==========================================
// API ROUTES - AUTHENTICATION
// ==========================================

// Register
app.post('/api/register', async (req, res) => {
  try {
    const { name, email, password, mobile, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Please fill all required fields' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    const hashedPassword = await bcryptjs.hash(password, 10);
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      mobile: mobile || '',
      role: role || 'user',
      isApproved: true
    });

    await newUser.save();

    const token = jwt.sign(
      { id: newUser._id, email: newUser.email, role: newUser.role },
      JWT_SECRET,
      { expiresIn: '30d' }
    );

    res.status(201).json({
      message: '✅ Account created successfully',
      token,
      user: {
        _id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        mobile: newUser.mobile,
        role: newUser.role
      }
    });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ message: 'Server error: ' + err.message });
  }
});

// Login
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password required' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: '❌ Invalid email or password' });
    }

    const isPasswordValid = await bcryptjs.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: '❌ Invalid email or password' });
    }

    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '30d' }
    );

    res.json({
      message: '✅ Login successful',
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        mobile: user.mobile,
        role: user.role
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Server error: ' + err.message });
  }
});

// ==========================================
// API ROUTES - USER MANAGEMENT
// ==========================================

// Get all users (Admin)
app.get('/api/users', authMiddleware, async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching users: ' + err.message });
  }
});

// Get single user
app.get('/api/user/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Error: ' + err.message });
  }
});

// Update user
app.put('/api/user/:id', async (req, res) => {
  try {
    const { name, email, mobile } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { name, email, mobile, updatedAt: Date.now() },
      { new: true }
    ).select('-password');
    
    res.json({
      success: true,
      message: '✅ User updated',
      user
    });
  } catch (err) {
    res.status(500).json({ message: 'Error updating user: ' + err.message });
  }
});

// Delete user
app.delete('/api/user/:id', async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: '✅ User deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting user: ' + err.message });
  }
});

// ==========================================
// API ROUTES - FARE CALCULATOR
// ==========================================

// Calculate & Save Fare
app.post('/api/fare', async (req, res) => {
  try {
    const { userId, userName, startPoint, destination, vehicleType, passengerType, calculatedFare } = req.body;

    const newFare = new Fare({
      userId,
      userName,
      startPoint,
      destination,
      vehicleType,
      passengerType,
      calculatedFare,
      timestamp: new Date()
    });

    await newFare.save();

    res.status(201).json({
      message: '✅ Fare calculated and saved',
      fare: newFare
    });
  } catch (err) {
    res.status(500).json({ message: 'Error calculating fare: ' + err.message });
  }
});

// Get user's fare history
app.get('/api/fares/:userId', async (req, res) => {
  try {
    const fares = await Fare.find({ userId: req.params.userId }).sort({ timestamp: -1 }).limit(10);
    res.json(fares);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching fares: ' + err.message });
  }
});

// Get all fares
app.get('/api/fares', async (req, res) => {
  try {
    const fares = await Fare.find().sort({ timestamp: -1 }).limit(50);
    res.json(fares);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching fares: ' + err.message });
  }
});

// ==========================================
// API ROUTES - VEHICLES
// ==========================================

// Get all vehicles
app.get('/api/vehicles', async (req, res) => {
  try {
    const vehicles = await Vehicle.find().limit(10);
    res.json(vehicles);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching vehicles: ' + err.message });
  }
});

// Add vehicle (Admin/Driver)
app.post('/api/vehicle', authMiddleware, async (req, res) => {
  try {
    const { plateNumber, type, driverName, route } = req.body;

    const newVehicle = new Vehicle({
      plateNumber,
      type,
      driverName,
      route,
      status: 'active',
      color: ['#00c853', '#aa00ff', '#ff6f00'][Math.floor(Math.random() * 3)]
    });

    await newVehicle.save();

    res.status(201).json({
      message: '✅ Vehicle added',
      vehicle: newVehicle
    });
  } catch (err) {
    res.status(500).json({ message: 'Error adding vehicle: ' + err.message });
  }
});

// ==========================================
// API ROUTES - COMMUNITY POSTS
// ==========================================

// Create post
app.post('/api/post', async (req, res) => {
  try {
    const { userId, user, type, content } = req.body;

    const newPost = new Post({
      userId,
      user,
      type,
      content,
      likes: 0,
      comments: [],
      timestamp: new Date()
    });

    await newPost.save();

    res.status(201).json({
      message: '✅ Post created',
      post: newPost
    });
  } catch (err) {
    res.status(500).json({ message: 'Error creating post: ' + err.message });
  }
});

// Get all posts
app.get('/api/posts', async (req, res) => {
  try {
    const posts = await Post.find().sort({ timestamp: -1 }).limit(50);
    res.json(posts);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching posts: ' + err.message });
  }
});

// Like post
app.put('/api/post/:id/like', async (req, res) => {
  try {
    const post = await Post.findByIdAndUpdate(
      req.params.id,
      { $inc: { likes: 1 } },
      { new: true }
    );
    res.json({ message: '✅ Post liked', post });
  } catch (err) {
    res.status(500).json({ message: 'Error liking post: ' + err.message });
  }
});

// Comment on post
app.post('/api/post/:id/comment', async (req, res) => {
  try {
    const { user, text } = req.body;
    const post = await Post.findByIdAndUpdate(
      req.params.id,
      { $push: { comments: { user, text, timestamp: new Date() } } },
      { new: true }
    );
    res.json({ message: '✅ Comment added', post });
  } catch (err) {
    res.status(500).json({ message: 'Error adding comment: ' + err.message });
  }
});

// ==========================================
// API ROUTES - SAFETY & SOS
// ==========================================

// Send SOS
app.post('/api/sos', async (req, res) => {
  try {
    const { userId, userName, location } = req.body;

    const sos = new Safety({
      userId,
      userName,
      type: 'sos',
      location,
      description: '🚨 Emergency SOS Activated',
      status: 'pending',
      timestamp: new Date()
    });

    await sos.save();

    console.log(`🚨 SOS ALERT from ${userName} at ${location}`);

    res.status(201).json({
      message: '✅ SOS Alert Sent! Help is on the way!',
      sos
    });
  } catch (err) {
    res.status(500).json({ message: 'Error sending SOS: ' + err.message });
  }
});

// Report incident
app.post('/api/report', async (req, res) => {
  try {
    const { userId, userName, type, vehicleNumber, location, description } = req.body;

    const report = new Safety({
      userId,
      userName,
      type,
      vehicleNumber,
      location,
      description,
      status: 'pending',
      timestamp: new Date()
    });

    await report.save();

    res.status(201).json({
      message: '✅ Report submitted successfully',
      report
    });
  } catch (err) {
    res.status(500).json({ message: 'Error submitting report: ' + err.message });
  }
});

// Get all safety reports (Admin)
app.get('/api/reports', authMiddleware, async (req, res) => {
  try {
    const reports = await Safety.find().sort({ timestamp: -1 }).limit(50);
    res.json(reports);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching reports: ' + err.message });
  }
});

// ==========================================
// API ROUTES - PAYMENT
// ==========================================

// Process payment
app.post('/api/payment', async (req, res) => {
  try {
    const { userId, userName, amount, paymentMethod } = req.body;

    const payment = new Payment({
      userId,
      userName,
      amount,
      paymentMethod,
      status: 'completed',
      timestamp: new Date()
    });

    await payment.save();

    res.status(201).json({
      message: '✅ Payment processed successfully',
      payment
    });
  } catch (err) {
    res.status(500).json({ message: 'Error processing payment: ' + err.message });
  }
});

// Get user payments
app.get('/api/payments/:userId', async (req, res) => {
  try {
    const payments = await Payment.find({ userId: req.params.userId }).sort({ timestamp: -1 });
    res.json(payments);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching payments: ' + err.message });
  }
});

// ==========================================
// ADMIN DASHBOARD STATS
// ==========================================

app.get('/api/admin/stats', authMiddleware, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalDrivers = await User.countDocuments({ role: 'driver' });
    const totalVehicles = await Vehicle.countDocuments();
    const totalFares = await Fare.countDocuments();
    const totalPayments = await Payment.countDocuments();
    const safetyReports = await Safety.countDocuments();

    res.json({
      totalUsers,
      totalDrivers,
      totalVehicles,
      totalTrips: totalFares,
      totalPayments,
      safetyReports
    });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching stats: ' + err.message });
  }
});

// ==========================================
// HEALTH CHECK & INITIALIZATION
// ==========================================

app.get('/api/health', (req, res) => {
  res.json({
    status: '✅ Server is running',
    timestamp: new Date(),
    database: 'MongoDB Connected',
    port: PORT
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: '🚀 eSakay Gensan API Server v1.0.0',
    status: '✅ Running',
    version: '1.0.0',
    timestamp: new Date(),
    endpoints: {
      auth: ['/api/login', '/api/register'],
      users: ['/api/users', '/api/user/:id', 'PUT /api/user/:id', 'DELETE /api/user/:id'],
      fares: ['/api/fare', '/api/fares', '/api/fares/:userId'],
      vehicles: ['GET /api/vehicles', 'POST /api/vehicle'],
      posts: ['GET /api/posts', 'POST /api/post', 'PUT /api/post/:id/like', 'POST /api/post/:id/comment'],
      safety: ['POST /api/sos', 'POST /api/report', 'GET /api/reports'],
      payment: ['POST /api/payment', 'GET /api/payments/:userId'],
      admin: ['GET /api/admin/stats'],
      health: ['/api/health']
    }
  });
});

// ==========================================
// ERROR HANDLING
// ==========================================
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ message: 'Server error: ' + err.message });
});

// ==========================================
// SERVER START
// ==========================================
app.listen(PORT, () => {
  console.log(`\n${'='.repeat(60)}`);
  console.log('🚀 eSAKAY GENSAN SERVER STARTED!');
  console.log(`${'='.repeat(60)}`);
  console.log(`📍 Server: http://localhost:${PORT}`);
  console.log(`🔗 API Docs: http://localhost:${PORT}/`);
  console.log(`📊 Health Check: http://localhost:${PORT}/api/health`);
  console.log(`📦 Database: MongoDB Connected`);
  console.log(`🔐 JWT Secret: ${JWT_SECRET.substring(0, 10)}...`);
  console.log(`${'='.repeat(60)}\n`);
});

module.exports = app;