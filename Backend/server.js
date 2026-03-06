require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

// CORS Configuration
const corsOptions = {
  origin: ['https://esakay-gensan-gcp.web.app', 'http://localhost:5173', 'http://localhost:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));
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
    
    // Create admin if doesn't exist
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
        console.log('🚀 Admin created: admin@esakay.com / admin12345');
      }
    } catch (err) {
      console.log('Admin already exists');
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
    timestamp: new Date(),
    environment: process.env.NODE_ENV
  });
});

// Routes
app.use('/api', require('./routes/authRoutes'));

// Error Handler
app.use((err, req, res, next) => {
  console.error('❌ Error:', err.message);
  res.status(500).json({ message: err.message });
});

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📍 API: ${process.env.CORS_ORIGIN || 'http://localhost:5000'}`);
});