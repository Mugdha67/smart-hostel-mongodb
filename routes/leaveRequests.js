const express = require('express');
const LeaveRequest = require('../models/LeaveRequest');
const { authenticateToken, isAdmin, isStudent } = require('../middleware/auth');
const router = express.Router();

// Student: Submit leave request
router.post('/', authenticateToken, isStudent, async (req, res) => {
    try {
        const { date_from, date_to, reason, emergency_contact, emergency_phone } = req.body;
        
        const leaveRequest = new LeaveRequest({
            user_id: req.user._id,
            date_from,
            date_to,
            reason,
            emergency_contact,
            emergency_phone
        });
        
        await leaveRequest.save();
        
        res.status(201).json({ 
            message: 'Leave request submitted successfully', 
            requestId: leaveRequest._id 
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message || 'Server error' });
    }
});

// Student: Get own leave requests
router.get('/my', authenticateToken, isStudent, async (req, res) => {
    try {
        const requests = await LeaveRequest.find({ user_id: req.user._id })
            .sort({ created_at: -1 });
        res.json(requests);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Admin: Get all leave requests
router.get('/', authenticateToken, isAdmin, async (req, res) => {
    try {
        const requests = await LeaveRequest.find()
            .populate('user_id', 'username full_name email')
            .populate({
                path: 'user_id',
                populate: { path: 'hostel_id', select: 'name' }
            })
            .sort({ 
                status: 1, // pending first
                created_at: -1 
            });
        
        const transformed = requests.map(r => ({
            id: r._id,
            date_from: r.date_from,
            date_to: r.date_to,
            reason: r.reason,
            emergency_contact: r.emergency_contact,
            status: r.status,
            admin_remarks: r.admin_remarks,
            created_at: r.created_at,
            username: r.user_id?.username,
            full_name: r.user_id?.full_name,
            hostel_name: r.user_id?.hostel_id?.name
        }));
        
        res.json(transformed);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Admin: Update leave request status
router.put('/:id', authenticateToken, isAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const { status, admin_remarks } = req.body;
        
        const updateData = { status, admin_remarks };
        if (status === 'approved') {
            updateData.approved_by = req.user._id;
            updateData.approved_at = new Date();
        }
        
        const leaveRequest = await LeaveRequest.findByIdAndUpdate(
            id,
            updateData,
            { new: true }
        );
        
        if (!leaveRequest) {
            return res.status(404).json({ error: 'Leave request not found' });
        }
        
        res.json({ message: 'Leave request updated successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;