const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

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

const budgetSchema = new mongoose.Schema({
    item_type: {
        type: String,
        required: true
    },
    description: {
        type: String,
        unique: true,
        required: true
    },
    value: {
        type: Number,
        min: 1,
        required: true
    } 
});
// credentialsSchema.pre('save',async function (next){
//     if(!this.isModified('password')) return next();
//     this.password = await bcrypt.hash(this.password,12);
//     next();
// })

module.exports = mongoose.model('Credentials',credentialsSchema);
