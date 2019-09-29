const { promisify } = require('util');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const DB = require('../ConnectDB');
const SECRET = 'THIS-IS-MY-SECRET-KEY-YOU-CANT-CRACK-IT';

exports.addItem = async (req,res) => {
    console.log('----------Headers--------');
    console.log(req.headers);
    const {item_type,description,value} = req.body; 
    console.log('---------Body----------');
    console.log(req.body);
    if(req.headers.authorization && req.headers.authorization.startsWith('Bearer')){
        const token = req.headers.authorization.split(' ')[1];
        console.log('Token: '+token);
        try{
            const decodedData = await promisify(jwt.verify)(token,SECRET);
            const user = await DB.getUserById(decodedData.id);
            const newItem = await DB.insertData({user,item_type,description,value})
            console.log('--------New Item-------');
            console.log(newItem);
            res.json({
                message: 'success',
                id: newItem._id
            })
        }catch(err){
            console.log(err.message);
            if(err.message === 'jwt expired'){
                res.json({message: 'JWT Expired'})
            }
            else{
                res.json({message: 'Not Authorized'})
            }
        }
    }
    else{
        res.json({message: 'Not Authorized'})
    }
}

exports.getUserData = async (req,res) => {
    console.log(`HEADERS: `,req.headers);
    console.log(`BODY: `,req.body);
    if(req.headers.authorization && req.headers.authorization.startsWith('Bearer')){
        const token = req.headers.authorization.split(' ')[1];
        console.log(`Token: ${token}`);
        try{
            const decodedData = await promisify(jwt.verify)(token,SECRET);
            console.log('Decoded:',decodedData);
            const user = await DB.getUserById(decodedData.id);
            const items = await DB.getData(user);
            const incomes = items.filter(item => item.item_type === '+');
            const expenses = items.filter(item => item.item_type === '-');
            console.log('--------Incomes------');
            console.log(incomes);
            console.log('--------Expenses---------');
            console.log(expenses);
            res.json({
                message: 'success',
                incomes,
                expenses,
                totalSize: items.length
            })
        }catch(err){
            if(err.message === 'jwt expired'){
                res.json({message: 'JWT expired'})
            }
            else{
                res.status(401).json({message: 'Not Authorized'})
            }
        }
    }
    else{
        res.status(401).json({message: 'Not Authorized'})
    }
}

exports.deleteItem = async (req,res) => {
    const {itemId} = req.body;
    console.log(`delete id: `,itemId);
    if(req.headers.authorization && req.headers.authorization.startsWith('Bearer')){
        const token = req.headers.authorization.split(' ')[1];
        try{
            const decodedData = await promisify(jwt.verify)(token,SECRET);
            // const user = await DB.getUserById(decodedData.id)
            const isDeleted = await DB.deleteItem(itemId);
            if(isDeleted){
                res.status(204).json({message: 'success'})
            }else{
                res.json({message: 'fail'})
            }
        }catch(err){
            if(err.message === 'jwt expired'){
                res.json({message: 'JWT expired'})
            }
            else{
                res.status(401).json({message: 'Not Authorized'})
            }
        }
    }
    else{
        res.status(401).json({message: 'Not Authorized'})
    }
}