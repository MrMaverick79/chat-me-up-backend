const mongoose = require('mongoose');

const RoomSchema = new mongoose.Schema({

    //The chatroom schema

    roomName: {
        type:String,
        required: true,
    },
    roomId: {
        type: Number 
    },                
    createdAt: {
        type: Date,
        default: Date.now
    },
    users:[{
        type: mongoose.Schema.Types.ObjectId, ref: "User"
    }],
    
    roomThumbnailUrl: String,
    
    messages: [{
        type: mongoose.Schema.Types.ObjectId, ref: "Message"
    }]
    


})


module.exports = mongoose.model('Room', RoomSchema);