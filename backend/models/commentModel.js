const mongoose=require('mongoose')

const commentSchema=mongoose.Schema({

    text:{
        type:String,
        required:[true,"Text is required"],
        trim:true
    },

    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
        required:true
    },
},
{
    timestamps:true
})


const Comment=mongoose.model("Comment",commentSchema)

module.exports=Comment