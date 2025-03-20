const dotenv=require('dotenv')
const mongoose=require('mongoose')


dotenv.config({path:"./.env"})

const app=require('./app')

mongoose.connect(process.env.DB_URL).then(()=>{
    console.log("database connection successfull")
})
.catch((err)=>console.log(err));

const port=process.env.PORT || 5000
const server=app.listen(port,()=>{
    console.log(`app is running on port:${port}`)
})

