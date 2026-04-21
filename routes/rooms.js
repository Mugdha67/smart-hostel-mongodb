const express = require('express');
const Room = require('../models/Room');
const Hostel = require('../models/Hostel');
const { authenticateToken, isAdmin } = require('../middleware/auth');
const router = express.Router();

// Get occupancy stats (admin only)
router.get('/stats/occupancy', authenticateToken, isAdmin, async (req, res) => {
    try {
        const hostels = await Hostel.find();
        const stats = [];
        
        for (const hostel of hostels) {
            const rooms = await Room.find({ hostel_id: hostel._id });
            const total_capacity = rooms.reduce((sum, r) => sum + r.capacity, 0);
            const total_occupied = rooms.reduce((sum, r) => sum + r.occupied, 0);
            const occupancy_rate = total_capacity > 0 
                ? ((total_occupied / total_capacity) * 100).toFixed(2)
                : 0;
            
            stats.push({
                hostel_name: hostel.name,
                total_rooms: rooms.length,
                total_capacity,
                total_occupied,
                occupancy_rate
            });
        }
        
        res.json(stats);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Get all rooms
router.get('/', authenticateToken, async (req, res) => {
    try {
        let query = {};
        
        // If student, show only rooms in their hostel
        if (req.user.role === 'student' && req.user.hostel_id) {
            query.hostel_id = req.user.hostel_id;
        }
        
        const rooms = await Room.find(query)
            .populate('hostel_id', 'name location')
            .sort({ 'hostel_id.name': 1, room_number: 1 });
        
        const transformed = rooms.map(room => ({
            id: room._id,
            room_number: room.room_number,
            hostel_name: room.hostel_id?.name,
            floor: room.floor,
            room_type: room.room_type,
            capacity: room.capacity,
            occupied: room.occupied,
            available_seats: room.available_seats,
            price: room.price,
            amenities: room.amenities
        }));
        
        res.json(transformed);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Admin: Create room
router.post('/', authenticateToken, isAdmin, async (req, res) => {
    try {
        const { room_number, hostel_id, capacity, floor, room_type, price, amenities } = req.body;
        
        const room = new Room({
            room_number,
            hostel_id,
            capacity: capacity || 2,
            floor,
            room_type: room_type || 'double',
            price: price || 0,
            amenities: amenities || []
        });
        
        await room.save();
        
        // Update hostel total_rooms count
        await Hostel.findByIdAndUpdate(hostel_id, { $inc: { total_rooms: 1 } });
        
        res.status(201).json({ 
            message: 'Room created successfully', 
            roomId: room._id 
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message || 'Server error' });
    }
});

// Admin: Update room
router.put('/:id', authenticateToken, isAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const { room_number, capacity, floor, room_type, price, amenities } = req.body;
        
        const room = await Room.findByIdAndUpdate(
            id,
            { room_number, capacity, floor, room_type, price, amenities },
            { new: true, runValidators: true }
        );
        
        if (!room) {
            return res.status(404).json({ error: 'Room not found' });
        }
        
        res.json({ message: 'Room updated successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Admin: Delete room
router.delete('/:id', authenticateToken, isAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        
        const room = await Room.findByIdAndDelete(id);
        
        if (!room) {
            return res.status(404).json({ error: 'Room not found' });
        }
        
        // Update hostel total_rooms count
        await Hostel.findByIdAndUpdate(room.hostel_id, { $inc: { total_rooms: -1 } });
        
        res.json({ message: 'Room deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Get room details
router.get('/:id', authenticateToken, async (req, res) => {
    try {
        const room = await Room.findById(req.params.id)
            .populate('hostel_id', 'name location');
        
        if (!room) {
            return res.status(404).json({ error: 'Room not found' });
        }
        
        const roomData = {
            id: room._id,
            room_number: room.room_number,
            hostel_name: room.hostel_id?.name,
            hostel_location: room.hostel_id?.location,
            floor: room.floor,
            room_type: room.room_type,
            capacity: room.capacity,
            occupied: room.occupied,
            available_seats: room.available_seats,
            price: room.price,
            amenities: room.amenities
        };
        
        res.json(roomData);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;