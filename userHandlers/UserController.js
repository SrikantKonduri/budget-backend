const { promisify } = require('util');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const fs = require('fs'); 
const path = require('path');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const DB = require('../ConnectDB');
const SECRET = 'THIS-IS-MY-SECRET-KEY-YOU-CANT-CRACK-IT';

exports.addItem = async (req,res) => {
    console.log('----------Headers--------');
    console.log(req.headers);
    const {item_type,description,value,item_date} = req.body; 
    console.log('---------Body----------');
    console.log(req.body);
    if(req.headers.authorization && req.headers.authorization.startsWith('Bearer')){
        const token = req.headers.authorization.split(' ')[1];
        console.log('Token: '+token);
        try{
            const decodedData = await promisify(jwt.verify)(token,SECRET);
            const user = await DB.getUserById(decodedData.id);
            const newItem = await DB.insertData({user,item_type,description,value,item_date})
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
    console.log(`PARAMS: `,req.params);
    if(req.headers.authorization && req.headers.authorization.startsWith('Bearer')){
        const token = req.headers.authorization.split(' ')[1];
        console.log(`Token: ${token}`);
        try{
            const decodedData = await promisify(jwt.verify)(token,SECRET);
            console.log('Decoded:',decodedData);
            const user = await DB.getUserById(decodedData.id);
            const items = await DB.getData(user,req.params.yearMonth);
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

exports.getProfile = async (req,res) => {
    if(req.headers.authorization && req.headers.authorization.startsWith('Bearer')){
        const token = req.headers.authorization.split(' ')[1];
        const decoded_info = await promisify(jwt.verify)(token,SECRET);
        const user  = await DB.getUserById(decoded_info.id);
        const uid = req.params.uid;
        const info = await DB.getUserInfo(uid);
        if(info.length === 1){
            var infoToSend = info[0];
            console.log('flag',infoToSend);
            if(infoToSend.name.length === 0){infoToSend.name = 'Buddy'}
            if(infoToSend.job.length === 0){infoToSend.job = '<Unknown>'}
            if(infoToSend.address.length === 0){infoToSend.address = '<Unknown>'}
            if(infoToSend.country.length === 0){infoToSend.country = '<Unknown>'}
            if(infoToSend.phone.length === 0){infoToSend.phone = '<Unknown>'}
            if(infoToSend.income === -1){infoToSend.income = '<Unknown>'}
            console.log('INFO',infoToSend.income);
            console.log('INFO-length',info.length);
            res.json({
                status: 'Data Exists',
                data: infoToSend
            })
        }
        else{
            console.log('Here')
            const infoToSend = {
                name: 'Buddy',
                job: '<Unknown>',
                address: '<Unknown>',
                country: '<Unknown>',
                phone: '<Unknown>',
                income: '<Unknown>',
            }    
            res.json({
                status: 'Data Not Exists',
                data: infoToSend
            });
        }
        console.log(info.length);
    }
    else{
        res.json({
            status: 'failure'
        })
    }

}

exports.addProfile = async (req,res) => {
    if(req.headers.authorization && req.headers.authorization.startsWith('Bearer')){
        const token = req.headers.authorization.split(' ')[1];
        try{
            const decodedData = await promisify(jwt.verify)(token,SECRET);
            console.log('DECODED...',decodedData);
            const user = await DB.getUserById(decodedData.id);
            const userExists = await DB.userExistsInUserInfo(req.params.uid);
            var userInfo = req.body;
            console.log('-------------------------------');
            console.log(userExists);
            if(!userExists){
                userInfo.uid = req.params.uid;
                console.log('dn');
                const iQueryRes = await DB.insertUserInfo(userInfo);
                console.log('^^^^^^^^ iQueryRes^^^^^',iQueryRes);
            }
            else{
                console.log('User Exists: true');
                console.log('UPDATE_RESPONSE',await DB.updateUserInfo(req.params.uid,userInfo));
            }
            res.json({status: 'success'});
        }catch(err){
            console.log(err.message);
            res.json({status: 'failure'});
        }
    }
}

exports.getAvatar = async (req,res) => {
    if(req.headers.authorization && req.headers.authorization.startsWith('Bearer')){
        const token = req.headers.authorization.split(' ')[1];
        const decoded_Data = await promisify(jwt.verify)(token,SECRET);
        const user = await DB.getUserById(decoded_Data.id);
        console.log('UID',req.body);
        const filename = await  DB.getAvatarFileName(req.body.uid);
        fs.readFile(`${__dirname}/../uploads/${filename}`,(err,data) => {
            if(err){
                console.log('ERROR!',err);
                res.status(204).json({status: 'No Avatar Found'})
            }
            else{
                console.log(data);
                console.log('Filename:   ',filename);
                res.status(200).sendFile(path.resolve(`${__dirname}/../uploads/${filename}`));
            }
        });
    }
    else{
        res.status(401).json({status: 'Not Authorized'})
    }
}

exports.uploadAvatar = async (req,res) => {
    console.log('Photo uploaded');
    console.log('---------Headers--------',req.headers);
    if(req.headers.authorization && req.headers.authorization.startsWith('Bearer')){
        const token = req.headers.authorization.split(' ')[1];
        try{
            const decodedData = await promisify(jwt.verify)(token,SECRET);
            console.log('**************',decodedData);
            console.log( await DB.setAvatarFileName(req.file.originalname));
            res.json({status: 'success'})
        }catch(err){
            res.status(401).json({status: 'failure'})
        }
    }
    else
        res.status(401).json({status: 'Not Authorized'})
}

exports.getStatement = async (req,res) => {
    console.log(req.body);
    if(req.headers.authorization && req.headers.authorization.startsWith('Bearer')){
        const token = req.headers.authorization.split(' ')[1];
        try{
            const decoded_Data = await promisify(jwt.verify)(token,SECRET);
            const user = await DB.getUserById(decoded_Data.id);
            const {type} = req.body;
            console.log('USER',user);
            if(type === 'inc'){
                console.log('flag');
                const filtered_items= await DB.getLast30DaysUserItems(user,'+');
                const csvWriter = createCsvWriter({
                    path: `./User Docs/inc${decoded_Data.id}.csv`,
                    header: [
                      {id: 'description',title: 'TITLE'},
                      {id: 'value',title: 'VALUE'},
                      {id: 'item_date',title: 'DATE'}
                    ]
                  });
                const records = filtered_items;
                const writeStatus = await csvWriter.writeRecords(records)
                res.setHeader('Content-Type','application/csv')
                res.download(`./User Docs/inc${decoded_Data.id}.csv`);
            }                  
            else if(type === 'exp'){
                const filtered_items= await DB.getLast30DaysUserItems(user,'-')
                const csvWriter = createCsvWriter({
                    path: `./User Docs/exp${decoded_Data.id}.csv`,
                    header: [
                      {id: 'description',title: 'TITLE'},
                      {id: 'value',title: 'VALUE'},
                      {id: 'item_date',title: 'DATE'}
                    ]
                  });
                const records = filtered_items;
                const writeStatus = await csvWriter.writeRecords(records)
                res.setHeader('Content-Type','application/csv')
                res.download(`./User Docs/exp${decoded_Data.id}.csv`);
            }
            else{
                const filtered_items= await DB.getLast30DaysUserItems(user,'both');
                const csvWriter = createCsvWriter({
                    path: `./User Docs/${decoded_Data.id}.csv`,
                    header: [
                      {id: 'item_type',title: 'TYPE'},
                      {id: 'description',title: 'TITLE'},
                      {id: 'value',title: 'VALUE'},
                      {id: 'item_date',title: 'DATE'}
                    ]
                  });
                const records = filtered_items;
                const writeStatus = await csvWriter.writeRecords(records)
                res.setHeader('Content-Type','application/csv')
                res.download(`./User Docs/${decoded_Data.id}.csv`);
            }
        }catch(err){
            console.log('ERROR:',err.message)
        }
    }
    else{
        res.status(401).json({status: 'Not Authorized'});
    }
}