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
        message: 'success',
        user: {
          data
        }
      });
      console.log('After sending response to client');
    }catch(err){
      console.log(`Error: ${err}`)
      res.json({
        message: 'fail'
      })
    }
}

exports.onLogin = async (req,res) => {
    const {username,password} = req.body;
    console.log(username,password);
    const result = await DB.verifyUser(username,password);
    console.log(result);
    if(result.userExist){
      const token = jwt.sign({id: result._id},SECRET,{expiresIn: '30m'});
      
      res.json({
        message: 'success',
        token,
        user: username.split('@')[0],
        ea: 30 * 60
      });
    }
    else{
      res.json({message: 'fail'});
    }
}