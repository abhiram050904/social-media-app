const User = require("../models/userModel"); // Ensure correct filename
const AppError = require("../utils/appError");
const generateOtp = require("../utils/generateOtp");
const jwt=require("jsonwebtoken")
const fs=require("fs")
const path=require("path")
const hbs=require("hbs");
const { title } = require("process");
const sendEmail = require("../utils/email");
const catchAsync = require("../utils/catchAsync");

const loadTemplate=(templateName,replacements)=>{
    const templatePath=path.join(__dirname,"../emailTemplate",templateName)
    const source=fs.readFileSync(templatePath,'utf-8')
    const template=hbs.compile(source)
    return template(replacements)
}
const signToken=(id)=>{
    return jwt.sign({id},process.env.JWT_SECRET,{expiresIn:process.env.JWT_EXPIRES_IN})
}

const createSendToken=(user,statusCode,res,message)=>{

    const token=signToken(user._id)
    const cookieoptions={
        expires:new Date(Date.now()+process.env.JWT_COOKIE_EXPIRES_IN*24*60*60*1000),
        httpOnly:true,
        secure:process.env.NODE_ENV === "production",
        sameSite:process.env.NODE_ENV === "production" ? "none" : "Lax"
    }
    res.cookie("token",token,cookieoptions);
    user.password=undefined;
    user.otp=undefined;
    res.status(statusCode).json({
        status:"Success",
        message,
        token,
        data:{
            user
        }
    })
}

const signup = async (req, res, next) => {
        const { email, password, passwordconfirm, username } = req.body;
        const existingUser = await User.findOne({ email });

        if (existingUser) {
            return next(new AppError("Email already registered", 400));
        }

        if (password.length < 8) {
            return next(new AppError("Password must be at least 8 characters long", 400));
        }

        const otp = generateOtp();
        const otpExpires = Date.now() + 24 * 60 * 60 * 1000; 

        const newUser = await User.create({
            username,
            email,
            password,
            passwordconfirm,
            otp,
            otpExpires,
        });

        const htmlTemplate=loadTemplate('otpTemplate.hbs',{
            title:'OTP VERIFICATION',
            username:newUser.username,
            otp,
            message:"YOUR ONE-TIME PASSWORD(OTP) FOR ACCOUNT VERIFICATION IS",

        })

        try{
            await sendEmail({
                email:newUser.email,
                subject:"OTP FOR EMAIL VERIFICATION",
                html:htmlTemplate,
            })

            createSendToken(newUser,200,res,"REGISTRATION SUCCESSFULL.CHECK YOUR EMAIL FOR OTP VERIFICATION")
        }
        catch(err){
            await User.findByIdAndDelete(newUser._id)
            return next(new AppError(`There is an error creating the account.Please try again later:${err}`,500))
        }
    };


    const verifyAccount=catchAsync(async(req,res,next)=>{

        const {otp}=req.body;
        if(!otp){
            return next(new AppError("otp is required for verification",400))
        }

        const user=req.user;
        if(user.otp!== otp){
            return next(new AppError("invalid otp",400))
        }

        if(Date.now()>user.otpExpires){
            return next(new AppError("otp has expired.Please request a new otp",400))
        }

        user.isVerified=true;
        user.otp=undefined
        user.otpExpires=undefined

        await user.save({validateBeforeSave:false})

        createSendToken(user,200,res,"Email has been verified")

    })

    const resendOtp=catchAsync(async(req,res,next)=>{
        const {email}=req.user;
        if(!email){
            return next(new AppError("Email is required",400))
        }

        const user=await User.findOne({email})

        if(!user){
            return next(new AppError("user not found",404))
        }

        if(user.isVerified){
            return next(new AppError("This account is already verifed",400))
        }

        const otp=generateOtp();
        const otpExpires= Date.now() + 24 * 60 * 60 * 1000;

        user.otp=otp;
        user.otpExpires=otpExpires

        await user.save({validateBeforeSave:false})

        const htmlTemplate=loadTemplate('otpTemplate.hbs',{
            title:'OTP VERIFICATION',
            username:user.username,
            otp,
            message:"YOUR ONE-TIME PASSWORD(OTP) FOR ACCOUNT VERIFICATION IS",

        })

        try{
            await sendEmail({
                email:user.email,
                subject:"RESEND OTP FOR EMAIL VERIFICATION",
                html:htmlTemplate,
            })

            res.status(200).json({
                status:"success",
                message:"A new Otp is send to your Email"
            })
        }
        catch(err){
            user.otp=undefined
            user.otpExpires=undefined
            await user.save({validateBeforeSave:false})
            return next(new AppError(`There is an error sending email.Please try again later:${err}`,500))
        }

    })



    const login=catchAsync(async(req,res,next)=>{
        const {email,password}=req.body
        if(!email || !password){
            return next(new AppError("Please provide email and password",400))
        }

        const user=await User.findOne({email}).select("+password")

        if(!user || !(await user.correctPassword(password,user.password))){
            return next(new AppError('Incorrect Email or password',401))
        }

        createSendToken(user,200,res,'Login Successfull')

    })


    const logout=catchAsync(async(req,res,next)=>{
        res.cookie("token","loggedout",{
            expiresIn:new Date(Date.now()+10 *1000),
            httpOnly:true,
            secure:process.env.NODE_ENV === "production",
        })

        res.status(200).json({
            status:"success",
            message:"Logged out successfully",
        })
    })

    const forgetPassword=catchAsync(async(req,res,next)=>{
        const {email}=req.body;
        const user=await User.findOne({email})

        if(!user){
            return next(new AppError("no user found",404))
        }

        const otp=generateOtp();
        const resetExpires=Date.now()+300000

        user.resetPasswordOTP=otp;
        user.resetPasswordOTPExpires=resetExpires;

        await user.save({validateBeforeSave:false})

        const htmlTemplate=loadTemplate('otpTemplate.hbs',{
            title:'RESET PASSWORD OTP',
            otp,
            message:"YOUR ONE-TIME PASSWORD(OTP) FOR PASSWORD RESET IS",

        })

        try{
            await sendEmail({
                email:user.email,
                subject:" OTP FOR PASSWORD RESET",
                html:htmlTemplate,
            })

            res.status(200).json({
                status:"success",
                message:"A new Otp is send to your Email FOR PASSWORD RESET,(Check the spam folder if not visible in Inbox)"
            })
        }
        catch(err){
            user.resetPasswordOTP=undefined
            user.resetPasswordOTPExpires=undefined
            await user.save({validateBeforeSave:false})
            return next(new AppError(`There is an error sending email.Please try again later:${err}`,500))
        }



    })

    const resetPassword=catchAsync(async(req,res,next)=>{
        const {email,otp,password,passwordconfirm}=req.body
        const user=await User.findOne({
            email,
            resetPasswordOTP:otp,
            resetPasswordOTPExpires:{$gt:Date.now()},
        })

        if(!user){
            return next(new AppError("No User Found",400))
        }

        user.password=password
        user.passwordconfirm=passwordconfirm
        user.resetPasswordOTP=undefined
        user.resetPasswordOTPExpires=undefined

        await user.save()
        createSendToken(user,200,res,"PASSWORD RESET SUCCESSFULL")


    })


    const changePassword=catchAsync(async(req,res,next)=>{
        const {currentPassword,newPassword,newPasswordConfirm}=req.body

        const {email}=req.user
        const user=await User.findOne({email}).select("+password")

        if(!user){
            return next(new AppError("USER NOT FOUND",404))
        }

        if(!await user.correctPassword(currentPassword,user.password)){
            return next(new AppError("INCORRECT CUURENT PASSWORD",400))
        }

        if(newPassword !== newPasswordConfirm){
            return next(new AppError("NEW PASSWORD AND CONFIRM PASSWORD ARE NOT SAME",400))
        }

        user.password=newPassword
        user.passwordconfirm=newPasswordConfirm

        await user.save()

        createSendToken(user,200,res,'PASSWORD CHANGE SUCCESSFULLY')
    })

module.exports = { signup, verifyAccount, resendOtp, login , logout, forgetPassword, resetPassword, changePassword};
