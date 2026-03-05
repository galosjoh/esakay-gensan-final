const mongoose = require('mongoose');

const fareSchema = new mongoose.Schema({
  userId: String,
  userName: String,
  startPoint: String,
  destination: String,
  vehicleType: String, // Jeepney, Tricycle, Bus
  passengerType: String, // Regular, Student, Senior
  calculatedFare: Number,
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Fare', fareSchema);