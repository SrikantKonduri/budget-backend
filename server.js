const express = require('express');
const mongoose = require('mongoose');
const server = express();
const cors = require('cors');

const routeHandlers = require('./routeHandlers/mainPageRoutes'); 

server.use(express.json());
server.use(cors({
  origin: 'http://localhost:3000'
}));
 
server.route(`/signup`)
  .post(routeHandlers.onSignup);
server.route(`/login`)
  .post(routeHandlers.onLogin);

server.listen(8000,() => {
    console.log(`Listening at 8000`); 
});


