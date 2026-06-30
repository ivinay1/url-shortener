const mongoose = require('mongoose');

const urlSchema = new mongoose.Schema({

    originalUrl: {
        type: String,
        required: true
    },
    shortCode: {
        type: String,
        required: true,
        unique: true
    },
    clicks: {
        type: Number,
        required: true,
        default: 0
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
        createdAt: {
        type: Date,
        default: Date.now
    }
})

const Url = mongoose.model('Url',urlSchema);

module.exports = Url;