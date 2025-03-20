const express=require('express')
const isAuthenticated = require('../middleware/isAuthenticated')
const upload = require('../middleware/multer')
const { createPost, getAllPost, getUserPosts, SaveOrUnsavePost, deletePost, likeOrDislikePost, addComment } = require('../controllers/postController')

const Router=express.Router()

Router.post('/create-post',isAuthenticated,upload.single('image'),createPost)
Router.get('/all',getAllPost)
Router.get('/user-post/:id',getUserPosts)
Router.post('/save-unsave-post/:postId',isAuthenticated,SaveOrUnsavePost)
Router.delete('/delete-post/:id',isAuthenticated,deletePost)
Router.post('/like-dislike/:id',isAuthenticated,likeOrDislikePost)
Router.post("/comment/:id",isAuthenticated,addComment)


module.exports=Router