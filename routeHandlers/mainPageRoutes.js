const Credentials = require('./../ConnectDB');
const jwt = require('jsonwebtoken');
const SECRET = 'THIS-IS-MY-SECRET-KEY-YOU-CANT-CRACK-IT';


exports.onSignup = async (req,res) => {
    const username = req.body.username;
    const password = req.body.password;
    
    try{
      const data = await new Credentials({username,password}).save()
      const token = jwt.sign({id: data._id},SECRET);
      console.log(`Saved: ${data}`)
      res.status(201).json({
        requestResult: 'success',
        token,
        body: {
          user: data
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
    const checkResult = await Credentials.findOne({username})
    if(checkResult && password === checkResult.password){
      const token = jwt.sign({id: checkResult._id},SECRET);
      res.json({
        serverRes: 'success',
        token
      });
    }
    else{
      res.json({serverRes: 'fail'});
    }
}