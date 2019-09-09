const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const SECRET = 'THIS-IS-MY-SECRET-KEY-YOU-CANT-CRACK-IT';

exports.addItem = async (req,res) => {
    const {type,description,value,token} = req.body;    
    const verificationData = await promisify(jwt.verify)(token,SECRET);
}

exports.getUserData = async (req,res) => {
    console.log(`HEADERS: `,req.headers);
    console.log(`BODY: `,req.body);
    if(req.headers.authorization && req.headers.authorization.startsWith('Bearer')){
        const token = req.headers.authorization.split(' ')[1];
        console.log(`Token: ${token}`);
        const decodedData = await promisify(jwt.verify)(token,SECRET);
        console.log(decodedData);
    }
    else{
        res.json({
            status: 'You are not authorized to access the content'
        })
    }
}