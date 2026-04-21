const mongoose = require('mongoose');

const noticeSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    content: {
        type: String,
        required: true
    },
    priority: {
        type: String,
        enum: ['normal', 'important', 'urgent'],
        default: 'normal'
    },
    posted_by: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    target_audience: {
        type: String,
        enum: ['all', 'students', 'admins'],
        default: 'all'
    },
    expires_at: Date,
    is_active: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: {
        createdAt: 'created_at'
    }
});

module.exports = mongoose.model('Notice', noticeSchema);