const mongoose = require('mongoose')

const postModel = mongoose.Schema({
    image: {
        type:String,
        required:true
    },
    likes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "users"
    }],
    dis:String,
    email:String,
    postbyId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users'
    },
    profileImg:String,
    username:String
},{timestamps:true})

module.exports = mongoose.model('post', postModel)