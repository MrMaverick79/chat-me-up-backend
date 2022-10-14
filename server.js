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
app.use( express.urlencoded({ etxended: true}));

//Socket.io
io.on('connection', (socket) => {
    console.log('a user connected to socket');
   
    socket.on('sendMessage', (message) => {
      console.log('Received a message', message);
      io.emit('getMessage', message)
    })



  });



server.listen(PORT, ()=> {
    console.log(`Server listening at http://localhost:${PORT} ...`);
})

//Mongoose db initialisation
const mongoose = require('mongoose');
const Room = require('./models/Room');
//other models here (user, messages)

mongoose.connect('mongodb://127.0.0.1/chatmu');
const db = mongoose.connection;

db.on('error', err => {
    console.log('Error connecting to DB server', err);
    process.exit( 1 );
    // TODO: leave Express server running, but set global error flag
    // and respond to all HTTP requests with an error message automatically
  });

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
        res.sendStatus( 422 ).json({error: 'Db connnection erro'}); //unprocessablle
    }
    
}); // /rooms