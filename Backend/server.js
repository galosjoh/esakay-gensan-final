require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const User = require('./models/User');

const app = express();

app.use(cors({
  origin: 'https://esakay-gensan-gcp.web.app', // Siguraduhin na ito ang GCP URL mo
  credentials: true
}));
app.use(express.json());

mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log('✅ MongoDB Connected');
    
    // --- AUTOMATIC ACCOUNT CREATION (SEEDING) ---
    // Gagawa ng Admin kung wala pa
    const adminEmail = 'admin@esakay.com';
    const adminExists = await User.findOne({ email: adminEmail });
    if (!adminExists) {
      await User.create({
        name: 'System Administrator',
        email: adminEmail,
        mobile: '09000000000',
        password: 'admin12345',
        role: 'admin',
        isApproved: true
      });
      console.log('🚀 Admin Account Created: admin@esakay.com / admin12345');
    }

    // Gagawa ng isang Test User para sa demo
    const userEmail = 'user@test.com';
    const userExists = await User.findOne({ email: userEmail });
    if (!userExists) {
      await User.create({
        name: 'Juan Dela Cruz',
        email: userEmail,
        mobile: '09123456789',
        password: 'user12345',
        role: 'user',
        isApproved: true
      });
      console.log('🚀 Test User Created: user@test.com / user12345');
    }
  })
  .catch(err => console.log('❌ DB Error:', err));

app.use('/api', require('./routes/authRoutes'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
