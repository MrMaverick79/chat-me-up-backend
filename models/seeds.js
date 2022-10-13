const mongoose = require('mongoose');

const Room = require('./Room');
const User = require('./User');
const Message = require('./Message')

// const MongoClient = require('mongodb').MongoClient;

mongoose.connect('mongodb://127.0.0.1:27017/chatmu'); //the url to reach the server on our machine

const db = mongoose.connection

db.on('error', err => {
      console.log('Error connecting to MongoDB', err);
      process.exit( 1 ); //non 0 means an erro
})

    
db.once('open', async() => {
    console.log('Success! DB connected, model loaded');

    await Room.deleteMany()

    const createdRooms = await Room.create([
      {
    
        roomName: 'All about cats',

        roomId: 123,
           
        createdDate: Date.now,

        roomThumbnailUrl: "https://place-puppy.com/200x200"

      },

      {

        roomName: 'Dogs rule',

        roomId: 456,
           
        createdDate: Date.now,
  
        participant: ['user1', 'user2' ],

        roomThumbnailUrl: "http://placekitten.com/g/200/200"

      },

    ]);
    console.log('Rooms:', createdRooms);

    //Message Seeds

    await Message.deleteMany();

    const createdMessages = await Message.create([
      {
        content: "Aren't dogs great?"

      },
      {
        content: "Yes-dogs are the best."

      },
      {
        content: "Cats are better."

      },
      {
        content: "Yes-I love cats!"

      }
    ]); //end message. create
     console.log("Messages:", createdMessages)

    //User seeds.

    process.exit(0)
})
      



