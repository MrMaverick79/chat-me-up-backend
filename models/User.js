const mongoose = require ('mongoose'); 

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
    },

    passwordDigest: String,

    createdAt: {
        type: Date,
        default: Date.now
    },
    
    thumbnailUrl: String,
        

    messages: [{
        type: mongoose.Schema.Types.ObjectId, ref: "Message"
    }],

    //Has many rooms
    rooms: [{
        type: mongoose.Schema.Types.ObjectId, ref: "Room"
    }],


    

})

module.exports = mongoose.model('User', UserSchema)