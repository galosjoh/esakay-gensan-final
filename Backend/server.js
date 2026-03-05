require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const User = require('./models/User');

const app = express();

app.use(cors({
  origin: 'https://esakay-gensan-gcp.web.app', // Google Cloud Frontend URL
  credentials: true
}));
app.use(express.json());

mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log('✅ MongoDB Connected');
    // AUTO-CREATE ADMIN ACCOUNT PARA SA DEMO
    const adminExists = await User.findOne({ email: 'admin@esakay.com' });
    if (!adminExists) {
      await User.create({
        name: 'System Administrator',
        email: 'admin@esakay.com',
        mobile: '09000000000',
        password: 'admin12345',
        role: 'admin',
        isApproved: true
      });
      console.log('🚀 Admin Created: admin@esakay.com / admin12345');
    }
  })
  .catch(err => console.log('❌ DB Error:', err));

app.use('/api', require('./routes/authRoutes'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
