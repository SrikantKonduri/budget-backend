const DB = require('../ConnectDB');
const jwt = require('jsonwebtoken');
const SECRET = 'THIS-IS-MY-SECRET-KEY-YOU-CANT-CRACK-IT';


exports.onSignup = async (req,res) => {
    const username = req.body.username;
    const password = req.body.password;
    console.log(`username: ${username}`);
    console.log(`password: ${password}`);
    try{
      const data = await DB.createNewUser(username,password);
      console.log(`Saved: ${data}`)
      res.status(201).json({
        requestResult: 'success',
        user: {
          data
        }
      });
      console.log('After sending response to client');
    }catch(err){
      console.log(`Error: ${err}`)
      res.json({
        requestResult: 'fail'
      })
    }
}

exports.onLogin = async (req,res) => {
    const {username,password} = req.body;
    console.log(username,password);
    const result = await DB.verifyUser(username,password);
    console.log(result);
    if(result.userExist){
      const token = jwt.sign({id: result._id},SECRET);
      res.json({
        serverRes: 'success',
        token
      });
    }
    else{
      res.json({serverRes: 'fail'});
    }
}