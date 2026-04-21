const mongoose = require('mongoose');

const leaveRequestSchema = new mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    date_from: {
        type: Date,
        required: true
    },
    date_to: {
        type: Date,
        required: true
    },
    reason: {
        type: String,
        required: true
    },
    emergency_contact: {
        type: String,
        required: true
    },
    emergency_phone: String,
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected', 'cancelled'],
        default: 'pending'
    },
    admin_remarks: String,
    approved_by: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    approved_at: Date
}, {
    timestamps: {
        createdAt: 'created_at'
    }
});

// Validate that date_from is before date_to
leaveRequestSchema.pre('save', function(next) {
    if (this.date_from >= this.date_to) {
        next(new Error('Start date must be before end date'));
    }
    next();
});

module.exports = mongoose.model('LeaveRequest', leaveRequestSchema);