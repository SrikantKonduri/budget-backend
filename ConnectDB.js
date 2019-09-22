const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

mongoose.connect('mongodb://localhost:27017/budget',{
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false
}).then(() => console.log('Connection Established!')).catch(() => console.log('Something went wrong...'))

//Schemas
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
    user:{
        type: String,
        required: true,
    },
    item_type: {
        type: String,
        required: true,
        enum: ['+','-']
    },
    description: {
        type: String,
        required: true
    },
    value: {
        type: Number,
        min: 1,
        required: true
    } 
});

//Creating collections
const Credentials = mongoose.model('Credentials',credentialsSchema);
const User_items = mongoose.model('User_items',budgetSchema);

//Authentcation
exports.createNewUser = (username,password) => {
    return new Credentials({username,password}).save()
}

exports.verifyUser = async (username,password) => {
    const checkResult = await Credentials.findOne({username})
    if(checkResult && password === checkResult.password){
        return {userExist: 1,_id: checkResult._id};
    }
    else{
        return {userExist: 0};
    }
}

exports.getUserById = async (id) => {
    console.log('id',id);
    const data = await Credentials.findById(id);
    return data.username.split('@')[0];
}

exports.getData = async (user) => {
    console.log(`=`);
    const data = await User_items.find({user});
    console.log(data);
    return data;
}

exports.insertData = async (newItem) => {
    console.log(newItem);
    return new User_items(newItem).save();
}

exports.deleteItem = async (itemId) => {
    const deleted = await User_items.findByIdAndDelete({_id: itemId});
    console.log('------Deleted--------');
    console.log(deleted);
    if(deleted){return 1;}
    else{return 0;}
}
// credentialsSchema.pre('save',async function (next){
//     if(!this.isModified('password')) return next();
//     this.password = await bcrypt.hash(this.password,12);
//     next();
// })

// module.exports = mongoose.model('Credentials',credentialsSchema);
