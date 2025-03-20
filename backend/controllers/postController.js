const sharp = require("sharp");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const { uploadToCloudinary, cloudinary } = require("../utils/cloudinary");
const Post = require("../models/postModel");
const User = require("../models/userModel");
const { trusted } = require("mongoose");
const Comment = require("../models/commentModel");

const createPost = catchAsync(async (req, res, next) => {
  const { caption } = req.body;
  const image = req.file;
  const userId = req.user._id;

  if (!image) {
    return next(new AppError("Image is required to post", 400));
  }

  const optimizedImageBuffer = await sharp(image.buffer)
    .resize({
      width: 800,
      height: 800,
      fit: "inside",
    })
    .toFormat("jpeg", { quality: 80 })
    .toBuffer();

  const fileUri = `data:image/jpeg;base64,${optimizedImageBuffer.toString(
    "base64"
  )}`;

  const cloudResponse = await uploadToCloudinary(fileUri);

  let post = await Post.create({
    caption,
    image: {
      url: cloudResponse.secure_url,
      publicId: cloudResponse.public_id,
    },
    user: userId,
  });

  const user = await User.findById(userId);

  if (user) {
    user.posts.push(post.id);
    await user.save({ validateBeforeSave: false });
  }

  post = await post.populate({
    path: "user",
    select: "username email bio profilePicture",
  });

  return res.status(201).json({
    status: "success",
    message: "Post created",
    data: {
      post,
    },
  });
});

const getAllPost = catchAsync(async (req, res, next) => {
  const posts = await Post.find()
    .populate({
      path: "user",
      select: "username profilePicture bio",
    })
    .populate({
      path: "comments",
      select: "text user",
      populate: {
        path: "user",
        select: "username profilePicture",
      },
    })
    .sort({ createdAt: -1 });

  return res.status(200).json({
    status: "success",
    results: posts.length,
    data: {
      posts,
    },
  });
});

const getUserPosts = catchAsync(async (req, res, next) => {
  const userId = req.params.id;

  const posts = await Post.find({ user: userId })
    .populate({
      path: "comments",
      select: "text user",
      populate: {
        path: "user",
        select: "username profilePicture",
      },
    })
    .sort({ createdAt: -1 });

  return res.status(200).json({
    status: "success",
    results: posts.length,
    data: {
      posts,
    },
  });
});

const SaveOrUnsavePost = catchAsync(async (req, res, next) => {
  const userId = req.user._id;
  const postId = req.params.postId;

  const user = await User.findById(userId);

  if (!user) {
    return next(new AppError("user not found", 404));
  }

  const isPositive = user.savedPosts.includes(postId);

  if (isPositive) {
    user.savedPosts.pull(postId);
    await user.save({ validateBeforeSave: false });
    return res.status(200).json({
      status: "success",
      message: "post unsaved successfully",
      data: {
        user,
      },
    });
  } else {
    user.savedPosts.push(postId);
    await user.save({ validateBeforeSave: false });
    return res.status(200).json({
      status: "success",
      message: "Post saved successfully",
      data: {
        user,
      },
    });
  }
});

const deletePost = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const userId = req.user.id;

  const post = await Post.findById(id).populate("user");

  if (!post) {
    return next(new AppError("Post not found", 404));
  }

  if (post.user._id.toString() !== userId.toString()) {
    return next(
      new AppError("You are not authorized to delete to this post", 403)
    );
  }

  await User.updateOne({ _id: userId }, { $pull: { posts: id } });

  await User.updateMany({ savedPosts: id }, { $pull: { savedPosts: id } });

  await Comment.deleteMany({ post: id });

  if (post.image.publicId) {
    await cloudinary.uploader.destroy(post.image.publicId);
  }

  await Post.findByIdAndDelete(id);

  res.status(200).json({
    status: "success",
    message: "Post deleted successfully",
  });
});

const likeOrDislikePost = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const userId = req.user._id;

  const post = await Post.findById(id);

  if (!post) {
    return next(new AppError("Posts not Found", 404));
  }

  const isLiked = post.likes.includes(userId);

  if (isLiked) {
    await Post.findByIdAndUpdate(id,{ $pull: { likes: userId } },{ new: true });
    
    return res.status(200).json({
      status: "success",
      message: "Post disliked Successfully",
    });
  }
  else{
    await Post.findByIdAndUpdate(id,{$addToSet:{likes:userId}},{new:true})

    return res.status(200).json({
        status:"success",
        message:"Post liked Successfully"
    })
  }
});


const addComment=catchAsync(async(req,res,next)=>{
    const {id:postId}=req.params
    const userId=req.user._id
    const {text}=req.body

    const post=await Post.findById(postId)

    if(!post){
        return next(new AppError("Post not found",404))
    }

    if(!text){
        return next(new AppError("Comment text is required",400))
    }

    const comment=await Comment.create({
        text,
        user:userId,
        createdAt:Date.now()
    })

    post.comments.push(comment)
    await post.save({validateBeforeSave:false})

    await comment.populate({
        path:"user",
        select:"username profilePicture bio"
    })

    res.status(200).json({
        status:"success",
        message:"Comment added Successfully",
        data:{
            comment
        }
    })

})

module.exports = { createPost, getAllPost, getUserPosts, SaveOrUnsavePost, deletePost,likeOrDislikePost, addComment};
