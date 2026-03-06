require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

// CORS Configuration
app.use(cors({
  origin: ['https://esakay-gensan-gcp.web.app', 'http://localhost:5173', 'http://localhost:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Request logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Database Connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
  .then(async () => {
    console.log('✅ MongoDB Connected');
    
    const User = require('./models/User');
    
    try {
      const adminExists = await User.findOne({ email: 'admin@esakay.com' });
      if (!adminExists) {
        await User.create({
          name: 'Admin User',
          email: 'admin@esakay.com',
          mobile: '09000000000',
          password: 'admin12345',
          role: 'admin',
          isApproved: true
        });
        console.log('🚀 Admin created');
      }
    } catch (err) {
      console.log('Admin exists or error:', err.message);
    }
  })
  .catch(err => {
    console.error('❌ MongoDB Error:', err.message);
    process.exit(1);
  });

// Health Check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'Server Running',
    timestamp: new Date()
  });
});

// Routes - IMPORTANT: Use /api prefix here
app.use('/api', require('./routes/authRoutes'));

// 404 Handler
app.use('/api/*', (req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Error Handler
app.use((err, req, res, next) => {
  console.error('Error:', err.message);
  res.status(500).json({ message: err.message });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server on port ${PORT}`);
});