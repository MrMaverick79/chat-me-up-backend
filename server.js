//express, HTTP, and socket.io set up
const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app)
const { Server } = require('socket.io');
const io = new Server(server, {
    cors: {
      origin:"https://cryptic-lake-39023.herokuapp.com/socket.io/*",
      methods: "*",
      credentials: true,
      pingTimeout: 7000,
      pingInterval: 3000
    }
  });

//Importing from .env
const dotenv = require('dotenv');
dotenv.config();

const PORT = process.env.PORT || 3000;

//Cors middleware
const cors = require('cors')
app.use( cors());

//To access POSTed body content, we need this
app.use( express.json());
app.use( express.urlencoded({ extended: true}));







//TODO: Update for prod
const { SERVER_SECRET_KEY }  = require ('./config.js')

//Authentication
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const jwtAuthenticate = require('express-jwt')





//Login
app.post('/login', async (req, res)=> {
    
    const {email, password} = req.body; //destructuring syntax

    try{
      const user = await User.findOne({email})

           

      if (user && bcrypt.compareSync(password, user.passwordDigest)) {
        //correct credentials
        const token  = jwt.sign(
        //the data to encode in the 'payload'
        {_id: user._id},
        process.env.SERVER_SECRET_KEY,
        {expiresIn: '72h'}

       );



        res.json({ token, user })
      
      
      } else{
        console.log('Login failed');
        res.status( 401 ).json({ success: false }); // Unauthorized
      }

    } catch(err){
      console.log('Unable to find user', err);
      res.sendStatus(500)
    }
}); //login


//New user
app.post('/user/create', async (req, res)=> {
    
  
  const {name, email, password} = req.body; //destructuring syntax

  try{
    const user = new User ({
      email: email, 
      name: name, 
      password: password
    })

    const token = jwt.sign(
      { _id: user._id },
      process.env.SERVER_SECRET_KEY,
      { expiresIn: '72h' }
    ) 
    

    
     res.json({ user, token })


  } catch( err ){

    console.log('Unable to create user', err);
    res.sendStatus(500)

  }
}); //login

app.get('/users', async(req, res)=> {

    try{
      const results= await User.find().select(['_id','name']);
      res.json(results)

    } catch(err){

      console.log("There has been an error accessing the user list", err);
      res.sendStatus(500)

    }

})// GET /users


//Socket.io
//Socket settings
io.on('connection', (socket) => {

    console.log('Socket Connected');

    //Grab a message sent from the front end, post it to the server, and then return it on success
    socket.on('sendMessage', async(message) => {
      await postMessage(message); //adds the message, user, and room to the server.
      io.emit('sendMessage', message)
    });

    
    //Find the room and the room details upon request from the front end and return the room on  success.
    socket.on('getRoom', async (roomId) => {
      
      const roomResult = await findRoom(roomId)       
      io.emit('roomResponse', roomResult)

    });

    //grab the meesages for a specific room
    socket.on('getMessages', async(roomId)=> {
      // console.log('Received a socket request from the front end for the messages from room:', roomId);
      const messageResult = await findMessagesByRoom(roomId)
      io.emit('messageResults', messageResult)

    }),

    socket.on("getUser", async(userId)=> {
      
      const userResponse = await getUser(userId)
      
      socket.emit("foundUser", {
        name: userResponse.name, url: userResponse.thumbnailUrl
      })
    })

})



server.listen(PORT, ()=> {
    console.log(`Server listening at http://localhost:${PORT} ...`);
})

//Mongoose db initialisation

const mongoose = require('mongoose');
const Room = require('./models/Room');
const Message = require('./models/Message');
const User = require('./models/User');
//other models here (user, messages)

mongoose.connect(process.env.MONGODB_URI);
const db = mongoose.connection;

db.on('error', err => {
    console.log('Error connecting to DB server', err);
    process.exit( 1 );
    
  });


//Routes

//Root route
app.get('/', (req, res) => {
    
    res.json({ hello: 'there'})
})  // route



const checkAuth = () => {
   
  return jwtAuthenticate.expressjwt({
    
    secret: process.env.SERVER_SECRET_KEY, //checks that the token has not been tampered with
    algorithms: ['HS256'],
    requestProperty: 'auth' //provides req.auth
  }) 

} //checkAuth()
//*** All routes below this post require log in ***
//TODO: sort this
// app.use( checkAuth());

app.use( async (req, res, next) => {

  try {
    const user = await User.findOne({ _id: req.auth._id });

    if( user === null ){
      res.sendStatus( 401 ); // invalid/stale token
      // Note that by running a response method here, this middleware will not
      // allow any further routes to be handled
    } else {
      req.current_user = user; // add 'current_user' for the next route to access
      next(); // move on to the next route handler/middleware in this server
    }

  } catch( err ){
    console.log('Error querying User in auth middleware', err);
    res.sendStatus( 500 );
  }

});  


//get all rooms
app.get('/rooms', async(req, res)=> {
     
    
    try{

        const rooms = await Room.find();
        res.json( rooms);

    } catch (err){
        console.log('Error loading all rooms');
        res.sendStatus( 422 ).json({error: 'Db connnection error'}); //unprocessablle
    }
    
}); // /rooms


//get specific room
app.get('/rooms/:id', async(req, res)=> {
   

    try{
      //Grab the messages and the associated details
      const messages = await Message.find({
          room: req.params.id
      }).populate("sender").populate("room");

      res.json(messages)
      // const currentRoom = await Room.findOne({_id: req.params.id})
      // res.json( currentRoom)

    } catch (err){
      console.log('There was an error trying to find that room', err);
      res.sendStatus(422); //unprocessable entity
    }
    
    
});

//add a new chatroom
app.post('/rooms/new', async(req, res) => {

   
    const userIds = req.body.users;
    let users=[];
    for (let i = 0; i < userIds.length; i++) {
      let user = await User.find({
        _id:userIds[i]});
      users.push(user);
      
    }

    

    try{
      
      const userArr = users.flat()
      
      const newRoom = new Room ({
          roomName : req.body.topic,
          users: userArr
          })
        
         
        await newRoom.save()

      res.json(newRoom)

    } catch(err){
      console.log('There has been an error trying to create this room', err);
      res.sendStatus( 422 )
    }

});


//Add a message via sockets
async function postMessage(message){
  
    try{
      const newMessage = new Message({
          content: message.message,
          sender: message.user,
          room: message.room
      });

      const post = await newMessage.save()

    } catch (err){
      console.log('Error posting message', err);
    }

}

//grab a user via socket
async function getUser(userId){

    try{
      const user =await User.findOne({_id: userId.id})
      return user

    } catch(err){
      console.log("There has been an error", err);


    };


}

//Find room details via socket
async function findRoom(roomId){

  try{
     const room = await Room.findOne({
       _id: roomId
    }).populate("users")
    return room

  } catch(err){

    console.log("Unable to find this room", err);
    return err
  } 

}//findRoom

//Find the messages that belong to a specific room on a socket request
async function findMessagesByRoom(roomId){

  try{
    //Grab the messages and the associated details
    const messages = await Message.find({
        room: roomId
    }).populate("sender").populate("room");

     return messages
   

  } catch (err){
    console.log('There was an error trying to find that room', err);
    return err
  }
}//end findMessagesByRoom()