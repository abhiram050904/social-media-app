const { promises } = require("nodemailer/lib/xoauth2");
const User = require("../models/userModel");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");
const { uploadToCloudinary } = require("../utils/cloudinary");
const getDataUri = require("../utils/dataUri");
const { login } = require("./authController");

const getProfile=catchAsync(async(req,res,next)=>{

    const {id}=req.params;

    const user=await User.findById(id).select("-password -otp -otpExpires -resetPasswordOTP -resetPasswordOTPExpires -passwordconfirm")
    .populate({
        path:"posts",
        options:{sort:{createdAt:-1}}
    })
    .populate({
        path:"savedPosts",
        options:{sort:{createdAt:-1}}
    })

    if(!user){
        return next(new AppError("User not found",404))
    }

    res.status(200).json({
        status:"success",
        data:{
            user
        }
    })
})



const editProfile=catchAsync(async(req,res,next)=>{

    const userId=req.user.id

    const {bio}=req.body
    const profilePicture=req.file


    let cloudResponse;

    if(profilePicture){
        const fileUri=getDataUri(profilePicture)
        cloudResponse=await uploadToCloudinary(fileUri)
    }

    const user =await User.findById(userId).select('-password')

    if(!user){
        return next(new AppError("user not found",404))
    }

    if(bio){
        user.bio=bio
    }

    if(profilePicture){
        user.profilePicture=cloudResponse.secure_url
    }

    await user.save({validateBeforeSave:false})

    return res.status(200).json({
        message:"PROFILE  UPDATED SUCCESSFULLY",
        status:"success",
        data:{
            user
        }
    })

})


const suggestedUser=catchAsync(async(req,res,next)=>{
    const loginUserId=req.user.id

    const users=await User.find({_id:{ $ne: loginUserId}}).select("-password -otp -otpExpires -resetPasswordOTP -resetPasswordOTPExpires -passwordconfirm")

    res.status(200).json({
        status:"success",
        data:{
            users
        }
    })
})


const followUnfollow=catchAsync(async(req,res,next)=>{
    const loginUserId=req.user._id
    const targetUserId=req.params.id

    if(loginUserId.toString() === targetUserId){
        return next(new AppError("You cannot follow/unfollow yourself",400))
    }

    const targetUser=await User.findById(targetUserId)

    if(!targetUser){
        return next(new AppError("user not found"))
    }

    const isFollowing=targetUser.followers.includes(loginUserId)

    if(isFollowing){
        await Promise.all([
            User.updateOne(
            {_id:loginUserId},
            {$pull:{following:targetUserId}}
            ),
            User.updateOne(
                {_id:targetUserId},
                {$pull : {followers:loginUserId}}
            )
        ])
    }

    else{
        await Promise.all([
            User.updateOne(
                {_id:loginUserId},
                {$addToSet:{following:targetUserId}}
                ),
                User.updateOne(
                    {_id:targetUserId},
                    {$addToSet : {followers:loginUserId}}
                )
        ])
    }


    const updateLoggedInUser=await User.findById(loginUserId).select('-password')

    res.json({
        message:isFollowing? "UNFOLLOW SUCCESSFULL" : " FOLLOW SUCCESSFULL",
        status:"success",
        data:{
            user:updateLoggedInUser
        }
    })
    
})

const getMe=catchAsync(async(req,res,next)=>{

    const user=req.user
    if(!user){
        return next(new AppError("User Not Authenticated",404))
    }

    res.status(200).json({
        status:"success",
        message:"Authenticated user",
        data:{
            user
        }
    })
})

module.exports={getProfile, editProfile, suggestedUser, followUnfollow, getMe}