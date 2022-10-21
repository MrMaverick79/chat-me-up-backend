const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const Room = require('./Room');
const User = require('./User');
const Message = require('./Message');

// const MongoClient = require('mongodb').MongoClient;

mongoose.connect('mongodb://127.0.0.1:27017/chatmu'); //the url to reach the server on our machine

const db = mongoose.connection

db.on('error', err => {
      console.log('Error connecting to MongoDB', err);
      process.exit( 1 ); //non 0 means an erro
})

    
db.once('open', async() => {
    console.log('Success! DB connected, model loaded');

    //User seeds.
    const createdUsers = await User.create([

      {
        name: "Test User 1",
        email: "test1@test.com",
        passwordDigest: bcrypt.hashSync('chicken', 10),
        messages: [
        ],
        userThumbnailUrl:"https://www.placecage.com/200/200" 

      },
      {
        name: "Test User 2",
        email: "test2@test.com",
        passwordDigest: bcrypt.hashSync('chicken', 10),
        messages: [
          
        ],
        userThumbnailUrl:"https://fillmurray.com/200/200"

      },


    ]) //end Users create

    console.log('Users created:', createdUsers);
    
    await Room.deleteMany()



    const createdRooms = await Room.create([
      {
    
        roomName: 'All about cats',

        roomId: 123,
           
        createdDate: Date.now,

        roomThumbnailUrl: "https://place-puppy.com/200x200",

         users:[
          createdUsers[0],
          createdUsers[1]
        ]

      },

      {

        roomName: 'Dogs rule',

        roomId: 456,
           
        createdDate: Date.now,
  
        roomThumbnailUrl: "http://placekitten.com/g/200/200",

        users:[
          createdUsers[0],
          createdUsers[1]
        ]

      },

    ]);
    console.log('Rooms:', createdRooms);

    

    //Message Seeds

    await Message.deleteMany();

    const createdMessages = await Message.create([
      {
        content: "Aren't dogs great?", 
        room: createdRooms[1],
        sender: createdUsers[0]     

      },
      {
        content: "Yes-dogs are the best.",
        room: createdRooms[1],
        sender: createdUsers[1]    

      },
      {
        content: "Cats are better.",
        room: createdRooms[0],
        sender: createdUsers[1]   

      },
      {
        content: "Yes-I love cats!",
        room: createdRooms[0],
        sender: createdUsers[0]     

      }
    ]); //end message. create
     console.log("Messages:", createdMessages)

    

    process.exit(0)
})
      



