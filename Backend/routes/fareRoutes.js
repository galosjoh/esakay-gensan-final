const express = require('express');
const router = express.Router();
const Fare = require('../models/Fare'); // Siguraduhin na tama ang path sa model mo

// POST - I-save ang calculated fare
router.post('/', async (req, res) => {
    try {
        const { userId, userName, startPoint, destination, vehicleType, passengerType, calculatedFare } = req.body;

        const newFare = new Fare({
            userId,
            userName,
            startPoint,
            destination,
            vehicleType,
            passengerType,
            calculatedFare
        });

        await newFare.save();
        res.status(201).json({ success: true, message: 'Fare saved successfully', data: newFare });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// GET - Kunin lahat ng fare history
router.get('/', async (req, res) => {
    try {
        const fares = await Fare.find().sort({ createdAt: -1 });
        res.json({ success: true, data: fares });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

module.exports = router; // <--- SOBRANG MAHALAGA ITO