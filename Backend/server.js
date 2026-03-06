require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

// Middleware
const corsOptions = {
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
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

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
  .then(async () => {
    console.log('✅ MongoDB Connected Successfully');
    
    const User = require('./models/User');
    
    // Auto-create admin account
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
        console.log('🚀 Admin Account Created: admin@esakay.com / admin12345');
      }
    } catch (err) {
      console.log('Admin account already exists or error:', err.message);
    }
  })
  .catch(err => {
    console.error('❌ MongoDB Connection Error:', err.message);
    process.exit(1);
  });

// Routes
app.use('/api', require('./routes/authRoutes'));

// Health Check Endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'Server Running',
    timestamp: new Date(),
    environment: process.env.NODE_ENV
  });
});

// Error Handling Middleware
app.use((err, req, res, next) => {
  console.error('❌ Error:', err.message);
  res.status(500).json({ 
    message: err.message,
    error: process.env.NODE_ENV === 'development' ? err : {}
  });
});

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📍 API URL: https://esakay-gensan-final.onrender.com`);
  console.log(`🔗 CORS Origin: ${process.env.CORS_ORIGIN}`);
});