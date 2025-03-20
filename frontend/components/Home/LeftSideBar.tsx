'use client'
import { Heart, HeartIcon, HomeIcon, icons, LogOutIcon, MessageCircle, Search, SquarePlus } from 'lucide-react'
import React, { useState } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar'
import { useDispatch, useSelector } from 'react-redux'
import { RootState } from '@/store/store'
import image from '../../public/logo_without_slogan.png'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import axios from 'axios'
import { BASE_URL } from '@/server'
import { setAuthUser } from '@/store/authSlice'
import { toast } from 'sonner'
import CreatePostModel from './CreatePostModel'
const LeftSideBar = () => {

    const user=useSelector((state:RootState)=>state.auth.user)
    const router=useRouter()
    const dispatch=useDispatch()

    const [isDialogOpen,setIsDialogOpen]=useState(false)

    const handleLogOut = async () => {
        try {
            console.log("Logging out...");
            await axios.post(`${BASE_URL}/users/logout`, {}, { withCredentials: true });
            dispatch(setAuthUser(null));
            toast.success("Logout Successful");
            router.push('/auth/login');
        } catch (error) {
            console.error("Logout failed:", error);
            toast.error("Logout failed. Please try again.");
        }
    };
    


      const handleSideBar=(label:string)=>{
        if(label === 'Home')router.push('/')
        if(label === 'LogOut') {handleLogOut()}
        if(label === 'Profile')router.push(`/profile/${user?._id}`)
        if(label === 'Create') setIsDialogOpen(true)
      }


    const sidebarLinks=[
        {
            icon:<HomeIcon/>,
            label:"Home"
        },
        {
            icon:<Search/>,
            label:"Search"
        },
        {
            icon:<MessageCircle/>,
            label:"Message"
        },
        {
            icon:<HeartIcon/>,
            label:"Notifications"
        },
        {
            icon:<SquarePlus/>,
            label:"Create"
        },
        {
            icon:(
                <Avatar className='w-9 h-9'>
                    <AvatarImage src={user?.profilePicture} className='h-full w-full'/>
                    <AvatarFallback>AB</AvatarFallback>
                </Avatar>
        ),
        label:"Profile"
        },
        {
            icon:<LogOutIcon/>,
            label:"LogOut"
        }
    ]
  return (
    <div className='h-full'>
        <CreatePostModel isOpen={isDialogOpen}  onClose={()=>setIsDialogOpen(false)}/>
        <div className='lg:p-6 p-3 cursor-pointer'>
        <div onClick={()=>{router.push("/")}}>
        <Image src={image} alt='Logo' width={150} height={150} className='mt-[2rem]'/>
        </div>
        <div className='mt-6'>
            {sidebarLinks.map((link)=>{
                return(
                    <div onClick={()=>handleSideBar(link.label)} key={link.label} className='flex items-center mb-2 p-3 rounded-lg group cursor-pointer transition-all duration-200 hover:bg-gray-100 space-x-2'>
                        <div className='group-hover:scale-110 transition-all duration-200'>
                            {link.icon}
                            </div>
                            <p className='lg:text-lg text-base'>{link.label}</p>
                    </div>
                )
            })}
        </div>
        </div>
        
    </div>
  )
}

export default LeftSideBar
