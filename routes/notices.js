const express = require('express');
const Notice = require('../models/Notice');
const { authenticateToken, isAdmin } = require('../middleware/auth');
const router = express.Router();

// Get all notices (for authenticated users)
router.get('/', authenticateToken, async (req, res) => {
    try {
        const notices = await Notice.find({ is_active: true })
            .populate('posted_by', 'username full_name')
            .sort({ 
                priority: 1, // urgent first
                created_at: -1 
            })
            .limit(50);
        
        const transformed = notices.map(n => ({
            id: n._id,
            title: n.title,
            content: n.content,
            priority: n.priority,
            created_at: n.created_at,
            posted_by_name: n.posted_by?.full_name || n.posted_by?.username
        }));
        
        res.json(transformed);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Admin: Create notice
router.post('/', authenticateToken, isAdmin, async (req, res) => {
    try {
        const { title, content, priority, target_audience, expires_at } = req.body;
        
        const notice = new Notice({
            title,
            content,
            priority: priority || 'normal',
            posted_by: req.user._id,
            target_audience: target_audience || 'all',
            expires_at: expires_at || null
        });
        
        await notice.save();
        
        res.status(201).json({ 
            message: 'Notice posted successfully', 
            noticeId: notice._id 
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Admin: Delete notice
router.delete('/:id', authenticateToken, isAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        
        // Soft delete - set is_active to false
        const notice = await Notice.findByIdAndUpdate(
            id,
            { is_active: false },
            { new: true }
        );
        
        if (!notice) {
            return res.status(404).json({ error: 'Notice not found' });
        }
        
        res.json({ message: 'Notice deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Admin: Update notice
router.put('/:id', authenticateToken, isAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const { title, content, priority } = req.body;
        
        const notice = await Notice.findByIdAndUpdate(
            id,
            { title, content, priority },
            { new: true }
        );
        
        if (!notice) {
            return res.status(404).json({ error: 'Notice not found' });
        }
        
        res.json({ message: 'Notice updated successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;