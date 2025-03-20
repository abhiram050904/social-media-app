const express=require("express")
const morgan=require("morgan")
const helmet=require('helmet')
const cors=require('cors')
const cookieParser=require('cookie-parser')
const mongosanitize=require('express-mongo-sanitize')
const path=require('path')

const dotenv=require('dotenv')
const AppError = require("./utils/appError")
const glovalErrorHandler=require('./controllers/errorController')
const userRouter=require('./routes/userRoutes')
const postRouter=require('./routes/postRoutes')

dotenv.config({path:"./env"})

const app=express();

//middlewares
app.use("/",express.static("uploads"))
app.use(cookieParser())
app.use(helmet())
app.use(cors({
    origin:['http://localhost:3000'],
    credentials:true,
}))
app.use(express.static(path.join(__dirname,'public')))

if(process.env.NODE_ENV=== 'development'){
    app.use(morgan("dev"))
}

app.use(express.json({limit:"10kb"}))
app.use(mongosanitize())


//routes for users
app.use("/api/v1/users",userRouter);

//routes for posts
app.use("/api/v1/posts",postRouter)


app.all("*",(req,res,next)=>{
    next(new AppError(`can't find ${req.originalUrl} on server!`,404))
})


app.use(glovalErrorHandler)
module.exports=app;