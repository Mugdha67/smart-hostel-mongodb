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

        // Find hostel by name or create if it doesn't exist
        let hostel = null;
        if (hostel_id) {
            hostel = await Hostel.findOne({ name: hostel_id });
            
            // If hostel doesn't exist in database, create it
            if (!hostel) {
                hostel = await Hostel.create({
                    name: hostel_id,
                    location: 'Campus',
                    description: `${hostel_id} - Student Hostel`
                });
                console.log(`Created new hostel: ${hostel_id}`);
            }
        }

        // Create user
        const user = new User({
            username,
            password,
            full_name,
            email,
            phone,
            hostel_id: hostel ? hostel._id : null,
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
        // Always return these 4 hostels
        const hostelNames = ['Abrar Fahad Hall', 'Osman Hadi Hall', 'Mannan Hall', 'Zia Hall'];
        
        // Check if hostels exist in database, create if not
        let hostels = await Hostel.find({ name: { $in: hostelNames } });
        
        if (hostels.length !== hostelNames.length) {
            // Create missing hostels
            for (const name of hostelNames) {
                const exists = hostels.some(h => h.name === name);
                if (!exists) {
                    await Hostel.create({
                        name: name,
                        location: 'Campus',
                        description: `${name} - Student Hostel`
                    });
                }
            }
            // Fetch again
            hostels = await Hostel.find({ name: { $in: hostelNames } });
        }
        
        // Return hostel names and IDs
        const responseHostels = hostels.map(h => ({
            id: h._id,
            name: h.name,
            location: h.location,
            description: h.description
        }));
        
        res.json(responseHostels);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;