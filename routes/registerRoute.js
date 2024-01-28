const express = require('express')
const router = express.Router()
const userModel = require('../models/userModel')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

const multer = require('multer')
const path = require('path')
const postModel = require('../models/postModel')
const fs = require('fs')

router.post('/register', async(req, res)=>{
    const {username, email, password} = req.body
    console.log('regis _id = ',req.body._id)
    bcrypt.hash(password, 12)
    .then(hash=>{
        userModel.create({username, email, password:hash})
        .then(ans=>{
            res.json(ans)
        }).catch(e=>res.json(e))
    }).catch(err=>res.json(err))
})

router.post('/login', async(req, res)=>{
    const {email, password} = req.body
    userModel.findOne({email: email})
    .then(ans=>{
        req.user = ans
        console.log('testt',req.user)
        if(!ans){
            res.json('User not found.')
        }else{
            bcrypt.compare(password, ans.password, (err, response)=>{
                if (response){
                    const token = jwt.sign({postbyId:ans, _id: ans._id, email: ans.email, username: ans.username}, process.env.KEY,{expiresIn: '1d'})
                    res.cookie('tk', token)
                    return res.json('Success')
                }else{
                    res.json('The password is wrong.')
                }
            })
        }
    }).catch(err=>console.log(err))
})

 const middleware = async(req, res, next)=>{
    const token = req.cookies.tk
    if (!token) {
        return res.json('Token is missing')
    }else{
        jwt.verify(token, process.env.KEY, (err, response)=>{
            if (err){
                return res.json('Token is wrong')
            }else{
                req.user = response.postbyId
                req._id = response._id
                req.email = response.email
                req.username = response.username
                next()
            }
        })
    }
}
module.exports = middleware

router.get('/',middleware, async(req, res)=>{
    return res.json({user: req.user, _id: req._id, email: req.email, username: req.username})
})

router.get('/logout', async(req, res)=>{
    res.clearCookie('tk')
    return res.json('Cleared')
})

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

router.post('/create', middleware,uploadPostImg.single('image'), async(req, res)=>{

    await postModel.create({image: req.file.filename, dis: req.body.dis, postbyId: req.user, email: req.user.email})
    .then(ans =>{
        res.json('posted')
    }).catch(err=>console.log(err))
})

router.delete('/delpost/:postId', async(req, res)=>{
    const postId = req.params.postId
    console.log(postId)
    const delpost = await postModel.findOneAndDelete({_id: postId})
    if (delpost) {
        await fs.unlink('./public/Image/' + delpost.image, (err)=>{
            if (err){
                console.log(err)
            }else{
                console.log('remove success')
            }
        })
    }
})

//profile

const pathProfile = multer.diskStorage({
    destination: (req, file, cb)=>{
        cb(null, 'public/Profile')
    },
    filename: (req, file, cb)=>{
        cb(null, 'profile' + file.fieldname + "_" + Date.now() + path.extname(file.originalname))
    }
})

const uploadProfile = multer({
    storage: pathProfile
})

router.get('/getid/:id',middleware, async(req, res)=>{
    const id = req.params.id
    const getid = await userModel.findOne({_id: id})
    res.json(getid)
})

router.post('/updateprofile/:myId', uploadProfile.single('profile'), async(req, res)=>{
    const myId = req.params.myId

    if (req.file){
        const delpic = await userModel.findOne({_id: myId})
        if (delpic) {
            await fs.unlink('./public/Profile/' + delpic.profilePicture, (err)=>{
                if (err){
                    console.log(err)
                }else{
                    console.log('remove success')  
                }})
        }
        const changePic = await userModel.findByIdAndUpdate(myId, {profilePicture: req.file.filename, username: req.body.username},{new:true})
        res.json(changePic)
    }else{
        const changeName = await userModel.findByIdAndUpdate(myId,{username:req.body.username},{new:true})
        res.json(changeName)
    }
})

router.get('/getpostid/:id', middleware, async(req, res)=>{
    const id = req.params.id
    const getpostid = await postModel.findOne({_id: id})
    res.json(getpostid)
})

router.put('/updatepost/:id', middleware, async(req, res)=>{
    const id = req.params.id
    const updatepost = await postModel.findByIdAndUpdate(id, {dis: req.body.dis},{new:true})
    res.json(updatepost)
})

router.put('/like/:id', middleware, async(req, res)=>{
    const id = req.params.id
    const findAndLike = await postModel.findByIdAndUpdate(id, {$push:{likes:req.user._id}},{new:true})
    res.json(findAndLike)
})

router.put('/unlike/:id', middleware, async(req, res)=>{
    const id = req.params.id
    const findAndUnlike = await postModel.findByIdAndUpdate(id, {$pull:{likes:req.user._id}},{new:true})
    res.json(findAndUnlike)
})

module.exports = router
