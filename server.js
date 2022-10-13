const express = require('express');
const app =express();
const PORT = 3000;

//Cors middleware
const cors = require('cors')
app.use( cors());

//To access POSTed body content, we need this
app.use( express.json());
app.use( express.urlencoded({ etxended: true}));

app.listen(PORT, ()=> {
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