const express = require('express')
const cors = require('cors')
const morgan = require('morgan')
const mongoose = require('mongoose')
const cookieParser = require('cookie-parser')
const bodyParser = require('body-parser')

require('dotenv').config()

const {readdirSync} = require('fs')

//fcmoxrWFYRvqMWYC
mongoose.connect(process.env.MONGOURL)
.then(()=>{
    console.log('DB connected..')
}).catch(err=>console.log(err))

const app = express()
app.use(cors({
    origin: ["https://instasam-begin.netlify.app"],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
}))
app.use(bodyParser.json())
app.use(express.json())
app.use(morgan('dev'))
app.use(cookieParser())
app.use(express.static('public'))

readdirSync('./routes').map((e)=>{
    console.log(e)
    app.use('/', require('./routes/' + e))
})

const port = process.env.PORT

app.listen(port, ()=>{
    console.log('Server is running on PORT ' + port)
})
