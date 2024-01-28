const router = require('express').Router()
const multer = require('multer')
const path = require('path')

const middleware = require('../routes/registerRoute')
const postModel = require('../models/postModel')
const userModel = require('../models/userModel')


const storagePost = multer.diskStorage({
    destination : (req, file, cb)=>{
        cb(null, 'public/Image')
    },
    filename: (req, file, cb)=>{
        cb(null, file.fieldname + "_" + Date.now() + path.extname(file.originalname))
    }
})

const uploadPostImg = multer({
    storage: storagePost
})


router.get('/getallpost', async(req, res)=>{
    await postModel.find({})
    .then(ans=>{
        res.json(ans)
    }).catch(err=>console.log(err))
})

router.get('/getprofileandusername', async(req,res)=>{
    try{
        const usernameandpro = await postModel.find().populate('postbyId', 'username profilePicture')
        res.json(usernameandpro)
    }catch(err){
        console.log(err)
    }
})

module.exports = router