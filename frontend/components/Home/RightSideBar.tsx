'use client'
import { BASE_URL } from '@/server'
import { RootState } from '@/store/store'
import { User } from '@/types'
import axios from 'axios'
import { useRouter } from 'next/navigation'
import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { handleAuthRequest } from '../utils/apiRequest'
import { Loader } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar'

const RightSideBar = () => {

    const user=useSelector((state:RootState)=>state.auth.user)
    const [suggestedUser,setSuggestedUser]=useState<User[]>([])
    const [isLoading,setIsLoading]=useState(false)
    const router=useRouter()

    useEffect(() => {
        const getSuggestedUser = async () => {
            try {
                const getSuggestedUserreq = async () => {
                    return axios.get(`${BASE_URL}/users/suggested-user`,{ withCredentials: true })
                }

                const result = await handleAuthRequest(getSuggestedUserreq, setIsLoading)

                if (result && result.data) {
                    setSuggestedUser(result.data.data.users)
                    console.log("working suggestions")
                }
            } catch (error) {
                console.error("Error fetching suggested users:", error)
            }
        }

        getSuggestedUser()
    }, []) 

    if(isLoading){
        return(
            <div className='w-full h-screen flex items-center justify-center flex-col'>
                <Loader className='animate-spin'/>
            </div>
        )
    }
    else{
        return(
            <div>
                <div className='flex items-center justify-between'>
                    <div className='flex items-center space-x-4'>
                        <Avatar className='w-9 h-9'>
                            <AvatarImage src={user?.profilePicture} className='h-full w-full rounded-full'/>
                            <AvatarFallback>AB</AvatarFallback>
                        </Avatar>
                        <div>
                            <h1 className='font-bold'>{user?.username}</h1>
                            <p className='text-gray-700'>{user?.bio || "My profile bio here"}</p>
                        </div>
                    </div>
                    {/* <h1 className='font-medium text-blue-700 cursor-pointer'>Switch</h1> */}
                </div>
                <div className='flex items-center justify-between mt-8'>
                    <h1 className='font-bold text-gray-700'>Suggested Users</h1>
                    <h1 className='font-medium cursor-pointer'>See all</h1>
                </div>
                {suggestedUser.slice(0,5).map((s_user)=>{
                    return <div onClick={()=>{router.push(`/profile/${s_user._id}`)}} key={s_user._id} className='mt-6 cursor-pointer'>
                        <div className='flex items-center justify-between'>
                            <div className='flex items-center space-x-4 cursor-pointer'>

                        <Avatar className='w-9 h-9'>
                            <AvatarImage src={s_user?.profilePicture} className='h-full w-full rounded-full'/>
                            <AvatarFallback>AB</AvatarFallback>
                        </Avatar>
                        <div>
                            <h1 className='font-bold'>{s_user.username}</h1>
                            <p className='text-gray-700'>
                                {s_user.bio || 'My profle bio here'}
                            </p>
                        </div>
                        <div>
                            <h1 className='font-medium text-gray-700 cursor-pointer'>Details</h1>
                        </div>

                            </div>
                        </div>
                    </div>
                })}
            </div>
        )
    }
}

export default RightSideBar
