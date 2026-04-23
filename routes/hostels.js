const express = require('express');
const Hostel = require('../models/Hostel');
const { authenticateToken, isAdmin } = require('../middleware/auth');
const router = express.Router();

// Get all hostels (public)
router.get('/', async (req, res) => {
    try {
        // First try to get from database
        let hostels = await Hostel.find().sort({ name: 1 });
        
        // If no hostels in DB, return the default ones
        if (hostels.length === 0) {
            return res.json([
                { name: 'Abrar Fahad Hall', location: 'Campus', description: 'Abrar Fahad Hall - Student Hostel' },
                { name: 'Osman Hadi Hall', location: 'Campus', description: 'Osman Hadi Hall - Student Hostel' },
                { name: 'Mannan Hall', location: 'Campus', description: 'Mannan Hall - Student Hostel' },
                { name: 'Zia Hall', location: 'Campus', description: 'Zia Hall - Student Hostel' }
            ]);
        }
        
        res.json(hostels);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Admin: Create hostel
router.post('/', authenticateToken, isAdmin, async (req, res) => {
    try {
        const { name, location, description } = req.body;
        
        if (!name) {
            return res.status(400).json({ error: 'Hostel name is required' });
        }
        
        const existingHostel = await Hostel.findOne({ name });
        if (existingHostel) {
            return res.status(400).json({ error: 'Hostel already exists' });
        }
        
        const hostel = new Hostel({
            name,
            location: location || 'Campus',
            description: description || ''
        });
        
        await hostel.save();
        res.status(201).json({ message: 'Hostel created successfully', hostel });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message || 'Server error' });
    }
});

// Admin: Update hostel
router.put('/:id', authenticateToken, isAdmin, async (req, res) => {
    try {
        const { name, location, description } = req.body;
        const hostel = await Hostel.findByIdAndUpdate(
            req.params.id,
            { name, location, description },
            { new: true, runValidators: true }
        );
        
        if (!hostel) {
            return res.status(404).json({ error: 'Hostel not found' });
        }
        
        res.json({ message: 'Hostel updated successfully', hostel });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Admin: Delete hostel
router.delete('/:id', authenticateToken, isAdmin, async (req, res) => {
    try {
        const hostel = await Hostel.findByIdAndDelete(req.params.id);
        if (!hostel) {
            return res.status(404).json({ error: 'Hostel not found' });
        }
        res.json({ message: 'Hostel deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;