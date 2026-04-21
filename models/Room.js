const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
    room_number: {
        type: String,
        required: true
    },
    hostel_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Hostel',
        required: true
    },
    capacity: {
        type: Number,
        default: 2,
        min: 1
    },
    occupied: {
        type: Number,
        default: 0,
        min: 0
    },
    floor: {
        type: Number,
        required: true
    },
    room_type: {
        type: String,
        enum: ['single', 'double', 'triple', 'dormitory'],
        default: 'double'
    },
    price: {
        type: Number,
        default: 0,
        min: 0
    },
    amenities: [String],
    is_available: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Virtual for available seats
roomSchema.virtual('available_seats').get(function() {
    return this.capacity - this.occupied;
});

// Ensure room_number + hostel_id is unique
roomSchema.index({ room_number: 1, hostel_id: 1 }, { unique: true });

module.exports = mongoose.model('Room', roomSchema);