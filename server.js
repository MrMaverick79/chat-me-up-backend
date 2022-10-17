//express, HTTP, and socket.io set up
const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app)
const { Server } = require('socket.io');
const io = new Server(server, {
    cors: {
      origin: "http://localhost:5173",
      methods: "*",
      credentials: true
    }
  });

const PORT = 3000;

//Cors middleware
const cors = require('cors')
app.use( cors());

//To access POSTed body content, we need this
app.use( express.json());
app.use( express.urlencoded({ extended: true}));


//Authentication
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const jwtAuthenticate = require('express-jwt')

const checkAuth = () => {
 
  return jwtAuthenticate.expressjwt({
    secret: SERVER_SECRET_KEY, //checks that the token has not been tampered with
    algorithms: ['HS256'],
    requestProperty: 'auth' //provides req.auth
  }) 

} //checkAuth

// TODO: This should be in a .env file which is not committed to this
// repo (because it's mentioned in your .gitignore), and loaded from 
// the shell environment using an NPM package like 'dotenv'
// - other sensitive data such as API access keys should also be stored
// this way.
// Also, use a command like 'md5' to generate a truly random secret key
const SERVER_SECRET_KEY = 'aSuperSecretKeyCHICKEN'

//Login
app.post('/login', async (req, res)=> {
    
    console.log('login:', req.body);

    const {email, password} = req.body; //destructuring syntax

    try{
      const user = await User.findOne({email}) //i.e email: email
      console.log('Found user', user);

      if (user && bcrypt.compareSync(password, user.passwordDigest)) {
        //correct credentials
       const token  = jwt.sign(
        //the data to encode in the 'payload'
        {_id: user._id},
        // the secret key to use to encrypt the token - this is what ensures that although
        // the token payload can be READ by anyone, only the server can MODIFY the payload
        // by using the secret key - i.e. users can't change their user ID
        SERVER_SECRET_KEY,
        {expiresIn: '72h'}

       );

       //equivalent of strong params
      //  const filteredUser = {
      //     name: user.name,
      //     email: user.email
      //  }

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

//Socket.io
//Socket settings
io.on('connection', (socket) => {
    console.log('a user connected to socket');

    //This one currently works  
    socket.on('sendMessage', (message) => {
      console.log('Received a message', message);
      io.emit('sendMessage', message)
    })


    

    socket.on('getRoom', (arg) => {
      // console.log('Received request to load room:', arg)
      io.emit('roomResponse', "The room is responding" )
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

mongoose.connect('mongodb://127.0.0.1/chatmu');
const db = mongoose.connection;

db.on('error', err => {
    console.log('Error connecting to DB server', err);
    process.exit( 1 );
    // TODO: leave Express server running, but set global error flag
    // and respond to all HTTP requests with an error message automatically
  });


//Routes
app.get('/', (req, res) => {
    console.log('Route route was requested');
    res.json({ hello: 'there'})
})  // route

app.get('/rooms', async(req, res)=> {
    try{

        const rooms = await Room.find();
        res.json( rooms);

    } catch (err){
        console.log('Error loading all rooms');
        res.sendStatus( 422 ).json({error: 'Db connnection error'}); //unprocessablle
    }
    
}); // /rooms

app.get('/rooms/:id', async(req, res)=> {
    console.log('Axios request made for /room/:id', req.params);

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