const express = require('express');
const mongoose = require('mongoose');
const server = express();
const cors = require('cors');
const url = 'http://localhost:8000';
server.use(express.json());

var corsOptions = {
  origin: 'http://localhost:3000',
  optionsSuccessStatus: 200 
}

mongoose.connect('mongodb://localhost:27017/budget',{
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false
}).then(() => console.log('Connection Established!')).catch(() => console.log('Something went wrong...'))

const credentialsSchema = new mongoose.Schema({
    username: {
       type: String,
       required: [true,'Give us a valid username'],
       unique: [true,'This username is already taken, please choose another username']
    },
    password: {
       type: String,
       required: [true,'Please provide valid password']
    }
});
const Credentials = mongoose.model('Credentials',credentialsSchema);

server.listen(8000,() => {
    console.log(`Listening at 8000`); 
});

server.use((response,request,next) => {
    cors(corsOptions);
    next();
});
server.route(`/signup`)
  .post((req,res) => {
    const username = req.body.username;
    const password = req.body.password;
    new Credentials({username,password}).save()
      .then(response => {
        console.log(`Saved: ${response}`)
        res.json({
          requestResult: 'success'
        })
      })
      .catch(err => {
        console.log(`Error: ${err}`)
        res.status(400).json({
          requestResult: 'fail'
        })
      });
  });
server.route(`/login`)
  .post((req,res) => {
      
  });
