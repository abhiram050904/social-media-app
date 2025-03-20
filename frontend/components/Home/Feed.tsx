'use client'
import { BASE_URL } from '@/server'
import { RootState } from '@/store/store'
import axios from 'axios'
import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { handleAuthRequest } from '../utils/apiRequest'
import { addComment, likeOrDislike, setPost } from '@/store/postSlice'
import { Bookmark, HeartIcon, Loader, Send } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar'
import DotButton from '../Helper/DotButton'
import Image from 'next/image'
import Comment from '../Helper/Comment'
import { toast } from 'sonner'
import { setAuthUser } from '@/store/authSlice'

const Feed = () => {

  const dispatch=useDispatch()

  const user=useSelector((state:RootState)=>state.auth.user)
  const posts=useSelector((state:RootState)=>state.posts.posts)


  const [comments,setComments]=useState("")
  const [isLoading,setIsLoading]=useState(false)


  useEffect(()=>{
    const getAllPost=async()=>{
      const getallpostreq=async()=>
        await axios.get(`${BASE_URL}/posts/all`);

      const result=await handleAuthRequest(getallpostreq,setIsLoading)

      if(result){
        dispatch(setPost(result.data.data.posts))
      }
    }
    getAllPost()
  },[dispatch])


  const handleLikeDislike=async(id:string)=>{
    const result=await axios.post(`${BASE_URL}/posts/like-dislike/${id}`,{},{withCredentials:true})

    if(result.data.status == 'success'){
      if(user?._id){
        dispatch(likeOrDislike({postId:id,userId:user._id}))
        toast(result.data.message)
      }
    }
  }

  const handleSaveUnsave = async (id: string) => {
    if (!id) {
      console.error("Post ID is undefined");
      return;
    }
  
    try {
      const result = await axios.post(`${BASE_URL}/posts/save-unsave-post/${id}`, {}, { withCredentials: true });
  
      if (result.data.status == 'success') {
        dispatch(setAuthUser(result.data.data.user));
        toast.success(result.data.message);
      }
    } catch (error) {
      console.error("Error in handleSaveUnsave:", error);
    }
  };
  

  const handleComment = async (id: string) => {
    if (!comments.trim()) return

    try {
      const result = await axios.post(`${BASE_URL}/posts/comment/${id}`, { text: comments }, { withCredentials: true })
      if (result.data.status === 'success') {
        dispatch(addComment({ postId: id, comment: result.data.data.comment }))
        toast.success("Comment posted successfully")
        setComments("")
      }
    } catch (error) {
      console.error("Error in handleComment:", error);
    }
  }


  
  if(isLoading){
    return (
      <div className='w-full h-screen flex items-center justify-center flex-col'>
        <Loader className='animate-spin'/>
      </div>
    )
  }

  if(posts.length<1){
    return (
      <div className='text-3xl m-8 text-center capitalize font-bold'>
        No Post To Show
      </div>
    )
  }

  

  return (
    <div className='mt-20 mb-20 w-[70%] mx-auto'>
      {posts.map((post)=>{
        return <div key={post._id} className='mt-8 mb-10'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center space-x-2'>
              <Avatar>
                <AvatarImage src={post.user?.profilePicture} className='h-full w-full'/>
                <AvatarFallback>AB</AvatarFallback>
              </Avatar>
              <h1>{post.user?.username}</h1>
            </div>
              <DotButton post={post} user={user}/>
          </div>
          <div className='mt-2'>
            <Image src={`${post.image?.url}`} alt='Post' width={800} height={400}/>
          </div>
          <div className='mt-3 flex items-center justify-between'>
            <div className='flex items-center space-x-4'>
              <HeartIcon onClick={()=>{handleLikeDislike(post._id)}} className={`cursor-pointer ${user?._id && post.likes.includes(user._id) ? 'text-red-500' :""}`} />
              <Comment post={post} user={user}/>
              <Send className='cursor-pointer'/>
            </div>

            <Bookmark onClick={()=>{handleSaveUnsave(post?._id)}} className={`cursor-pointer ${(user?.savedPosts as string[])?.some((savedPostId:string)=>savedPostId === post._id) ? 'text-red-500' :""}`}/>
          </div>
          <h1 className='mt-2 text-sm font-semibold'>
            {post.likes.length}likes
          </h1>
          <p className='mt-2 font-medium'>{post.caption}</p>
          <div className='mt-2 flex items-center'>
            <input type='text' placeholder='Add a Comment...' className='flex-1 placeholder:text-gray-800 outline-none' value={comments} onChange={(e)=>setComments(e.target.value)}/>
            <p role='button' className='text-sm font-semibold text-blue-700 cursor-pointer' onClick={()=>handleComment(post._id)}>Post</p>
          </div>
          <div className='pb-6 border-b-2'></div>
        </div>
      })}
    </div>
  )
}

export default Feed
