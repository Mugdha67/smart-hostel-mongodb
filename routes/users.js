const express = require('express');
const User = require('../models/User');
const Hostel = require('../models/Hostel');
const Room = require('../models/Room');
const { authenticateToken, isAdmin } = require('../middleware/auth');
const router = express.Router();

// Get user profile
router.get('/profile', authenticateToken, async (req, res) => {
    try {
        const user = await User.findById(req.user._id)
            .populate('hostel_id', 'name location')
            .populate('room_id', 'room_number floor room_type');
        
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        
        res.json({
            id: user._id,
            username: user.username,
            full_name: user.full_name,
            email: user.email,
            phone: user.phone,
            role: user.role,
            hostel_id: user.hostel_id?._id,
            hostel_name: user.hostel_id?.name,
            room_number: user.room_id?.room_number,
            room_floor: user.room_id?.floor,
            room_type: user.room_id?.room_type
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Update user profile
router.put('/profile', authenticateToken, async (req, res) => {
    try {
        const { full_name, email, phone } = req.body;
        
        const user = await User.findByIdAndUpdate(
            req.user._id,
            { full_name, email, phone },
            { new: true, runValidators: true }
        );
        
        res.json({ 
            message: 'Profile updated successfully',
            user: {
                full_name: user.full_name,
                email: user.email,
                phone: user.phone
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Admin: Get all users
router.get('/', authenticateToken, isAdmin, async (req, res) => {
    try {
        const users = await User.find()
            .populate('hostel_id', 'name')
            .populate('room_id', 'room_number')
            .select('-password')
            .sort({ created_at: -1 });
        
        const transformed = users.map(user => ({
            id: user._id,
            username: user.username,
            full_name: user.full_name,
            email: user.email,
            phone: user.phone,
            role: user.role,
            hostel_name: user.hostel_id?.name,
            room_number: user.room_id?.room_number,
            created_at: user.created_at
        }));
        
        res.json(transformed);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Admin: Update user
router.put('/:id', authenticateToken, isAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const { full_name, email, phone, hostel_id, room_id } = req.body;
        
        const user = await User.findByIdAndUpdate(
            id,
            { full_name, email, phone, hostel_id, room_id },
            { new: true, runValidators: true }
        ).select('-password');
        
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        
        res.json({ message: 'User updated successfully', user });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Admin: Delete user
router.delete('/:id', authenticateToken, isAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        
        const user = await User.findByIdAndDelete(id);
        
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        
        res.json({ message: 'User deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;