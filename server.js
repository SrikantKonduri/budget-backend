const express = require('express');
const mongoose = require('mongoose');
const server = express();
const cors = require('cors');
const multer = require('multer');
const storage = multer.diskStorage({
  destination: (req,file,cb) => {
    cb(null,'./uploads/');
  },
  filename: (req,file,cb) => {
    cb(null,file.originalname)
  }
})
const upload = multer({
  storage
});
const routeHandlers = require('./routeHandlers/AuthController'); 
const userHandlers = require('./userHandlers/UserController');

server.use(express.json());
server.use(cors({
  origin: 'http://localhost:3000'
}));
 
server.route(`/signup`)
  .post(routeHandlers.onSignup);

server.route(`/login`)
  .post(routeHandlers.onLogin);

server.route(`/users`)
  .get(userHandlers.getUserData)
  .post(userHandlers.addItem)
  .delete(userHandlers.deleteItem);

server.route('/profile/:uid')
  .get(userHandlers.getProfile) 
  .post(userHandlers.addProfile)

server.route('/profile')
  .post(userHandlers.getAvatar)
  
server.route('/upload')
  .post(upload.single('avatar'),userHandlers.uploadAvatar);

server.listen(8000,() => {
    console.log(`Listening at 8000`); 
});


