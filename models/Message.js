const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({

    content: String,
    createdAt: {
        type: Date,
        default: Date.now
    },

    user:{
        type: mongoose.Schema.Types.ObjectId, ref: "User"
    },

    room: {
        type: mongoose.Schema.Types.ObjectId, ref: "Room"
    }


});

module.exports = mongoose.model('Message', MessageSchema)