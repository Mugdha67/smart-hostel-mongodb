const express = require('express');
const Complaint = require('../models/Complaint');
const User = require('../models/User');
const { authenticateToken, isAdmin, isStudent } = require('../middleware/auth');
const router = express.Router();

// Student: Submit complaint
router.post('/', authenticateToken, isStudent, async (req, res) => {
    try {
        const { title, message, category } = req.body;
        
        const complaint = new Complaint({
            user_id: req.user._id,
            title,
            message,
            category: category || 'other'
        });
        
        await complaint.save();
        
        res.status(201).json({ 
            message: 'Complaint submitted successfully', 
            complaintId: complaint._id 
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Student: Get own complaints
router.get('/my', authenticateToken, isStudent, async (req, res) => {
    try {
        const complaints = await Complaint.find({ user_id: req.user._id })
            .sort({ created_at: -1 });
        res.json(complaints);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Admin: Get all complaints
router.get('/', authenticateToken, isAdmin, async (req, res) => {
    try {
        const complaints = await Complaint.find()
            .populate('user_id', 'username full_name email')
            .populate({
                path: 'user_id',
                populate: { path: 'hostel_id', select: 'name' }
            })
            .sort({ 
                status: 1, // pending first
                created_at: -1 
            });
        
        // Transform data for frontend
        const transformed = complaints.map(c => ({
            id: c._id,
            title: c.title,
            message: c.message,
            category: c.category,
            status: c.status,
            admin_response: c.admin_response,
            created_at: c.created_at,
            updated_at: c.updated_at,
            username: c.user_id?.username,
            full_name: c.user_id?.full_name,
            hostel_name: c.user_id?.hostel_id?.name
        }));
        
        res.json(transformed);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Admin: Update complaint status
router.put('/:id', authenticateToken, isAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const { status, admin_response } = req.body;
        
        const updateData = { status, admin_response };
        if (status === 'resolved') {
            updateData.resolved_at = new Date();
        }
        
        const complaint = await Complaint.findByIdAndUpdate(
            id,
            updateData,
            { new: true }
        );
        
        if (!complaint) {
            return res.status(404).json({ error: 'Complaint not found' });
        }
        
        res.json({ message: 'Complaint updated successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;