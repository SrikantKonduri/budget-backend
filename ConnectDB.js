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
    },
    avatarFileName: {
        type: String
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

const userInfoSchema = new mongoose.Schema({
    uid:{
        type: String,
        unique: true
    },
    name:{
        type: String,
        default: ''
    },
    phone:{
        type: String,     
        default: ''
    },
    address:{
        type: String,
        maxlength: 50,
        default: ''
    },
    country:{
        type: String,
        default: ''
    },
    job:{
        type: String,
        default: ''
    },
    income: {
        type: Number,
        default: -1
    }
}) 

//Creating collections
const Credentials = mongoose.model('Credentials',credentialsSchema);
const User_items = mongoose.model('User_items',budgetSchema);
const User_info = mongoose.model('User_info',userInfoSchema);

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

exports.setAvatarFileName = async (avatarFileName) => {
    return Credentials.findByIdAndUpdate(`${avatarFileName.split('.')[0]}`,{avatarFileName})
}

exports.getAvatarFileName =  async (id) => {
    const userCred =  await Credentials.findById(id);
    console.log('FN',userCred.avatarFileName);
    return userCred.avatarFileName;
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

exports.getUserInfo = async (uid) => {
    const info = await User_info.find({uid})
    return info;
}

exports.insertUserInfo = async (userInfo) => {
    return new User_info(userInfo).save()
}

exports.updateUserInfo = async (uid,userInfo) => {
    const update_info =  await User_info.findOneAndUpdate({uid},userInfo,{new: true})
    return update_info;
}

exports.userExistsInUserInfo = async (uid) => {
    const query_res = await User_info.findOne({uid})
    // console.log('----------Query_res--------',query_res);
    return query_res;
}
// credentialsSchema.pre('save',async function (next){
//     if(!this.isModified('password')) return next();
//     this.password = await bcrypt.hash(this.password,12);
//     next();
// })

// module.exports = mongoose.model('Credentials',credentialsSchema);
