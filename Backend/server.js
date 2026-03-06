require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

// CORS Configuration
app.use(cors({
  origin: ['https://esakay-gensan-gcp.web.app', 'http://localhost:5173', 'http://localhost:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// --- DATABASE CONNECTION & SEEDING ---
mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log('✅ MongoDB Connected');
    
    const User = require('./models/User');
    
    // Create admin account if it doesn't exist
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
      console.log('🚀 Admin account created: admin@esakay.com / admin12345');
    }
  })
  .catch(err => {
    console.log('❌ Database connection error:', err);
    process.exit(1);
  });

// Routes
app.use('/api', require('./routes/authRoutes'));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'Server is running' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
