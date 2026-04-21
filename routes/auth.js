const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Hostel = require('../models/Hostel');
const router = express.Router();

// Register
router.post('/register', async (req, res) => {
    try {
        const { username, password, full_name, email, phone, hostel_id } = req.body;
        
        // Validate input
        if (!username || !password) {
            return res.status(400).json({ error: 'Username and password are required' });
        }

        // Check if user exists
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(400).json({ error: 'Username already exists' });
        }

        // Create user
        const user = new User({
            username,
            password,
            full_name,
            email,
            phone,
            hostel_id: hostel_id || null,
            role: 'student'
        });

        await user.save();

        res.status(201).json({ 
            message: 'Registration successful', 
            userId: user._id 
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message || 'Server error' });
    }
});

// Login
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        // Get user with populated fields
        const user = await User.findOne({ username })
            .populate('hostel_id', 'name location')
            .populate('room_id', 'room_number');

        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Verify password
        const validPassword = await user.comparePassword(password);
        if (!validPassword) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Generate JWT
        const token = jwt.sign(
            { id: user._id, username: user.username, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({
            message: 'Login successful',
            token,
            user: {
                id: user._id,
                username: user.username,
                full_name: user.full_name,
                email: user.email,
                phone: user.phone,
                role: user.role,
                hostel_id: user.hostel_id?._id,
                hostel_name: user.hostel_id?.name,
                room_number: user.room_id?.room_number
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Get all hostels
router.get('/hostels', async (req, res) => {
    try {
        const hostels = await Hostel.find({}, 'name location description');
        res.json(hostels);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;