const mongoose = require('mongoose');

const hostelSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    location: {
        type: String,
        required: true,
        default: 'Campus'
    },
    description: {
        type: String,
        default: ''
    },
    total_rooms: {
        type: Number,
        default: 0
    }
}, {
    timestamps: {
        createdAt: 'created_at'
    }
});

// Add index for faster queries
hostelSchema.index({ name: 1 });

module.exports = mongoose.model('Hostel', hostelSchema);