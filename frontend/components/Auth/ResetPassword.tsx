'use client'
import { useRouter, useSearchParams } from 'next/navigation'
import React, { useState } from 'react'
import PasswordInput from './PasswordInput'
import LoadingButton from '../Helper/LodingButton'
import { Button } from '../ui/button'
import Link from 'next/link'
import { useDispatch } from 'react-redux'
import axios from 'axios'
import { BASE_URL } from '@/server'
import { handleAuthRequest } from '../utils/apiRequest'
import { setAuthUser } from '@/store/authSlice'
import { toast } from 'sonner'

const ResetPassword = () => {

    const searchParams=useSearchParams()
    const email=searchParams.get("email")

    const [otp,setotp]=useState("")
    const [password,setPassword]=useState("")
    const [passwordconfirm,setPasswordConfirm]=useState("")
    const [isLoading,setIsLoading]=useState(false)
    const dispatch=useDispatch()
    const router=useRouter()

    const handleSubmit=async()=>{
       if(!otp || !password || !passwordconfirm){
        return;}

        const data={email,otp,password,passwordconfirm}

        console.log("data before submit:",data)
        const resetReq= async ()=>
            await axios.post(`${BASE_URL}/users/reset-password`,data,{withCredentials:true})

        const result= await handleAuthRequest(resetReq,setIsLoading)

        if(result){
            dispatch(setAuthUser(result.data.data.user))
            toast.success(result.data.message)
            console.log("result is:",result)
            router.push("/auth/login")
        }
       } 

  return (
    <div className='h-screen flex items-center justify-center flex-col'>
      <h1 className='text-2xl sm:text-3xl font-bold mb-3'>Reset Your Password</h1>
      <p className='mb-6 text-sm sm:text-base text-center text-gray-600 font-medium'>
        Enter your OTP and new Password to reset Your Password
      </p>

      <input type='number' placeholder='Enter OTP' className='block w-[90%] sm:w-[80%] md:w-[60%] lg:w-[40%] xl:w-[30%] mx-auto px-6 py-3 bg-gray-300 rounded-lg no-spinner outline-none' value={otp} onChange={(e)=>setotp(e.target.value)}/>
      <div className='mb-4 mt-4 w-[90%] sm:w-[80%] lg:w-[40%] xl:w-[30%]'>
        <PasswordInput name='password' palceholder='Enter your new Password' inputClassName='px-6 py-3 bg-gray-300 rounded-lg outline-none' value={password} onChange={(e)=>setPassword(e.target.value)}/>
      </div>
      <div className='mb-4 mt-4 w-[90%] sm:w-[80%] lg:w-[40%] xl:w-[30%]'>
        <PasswordInput name='passwordconfirm' palceholder='Confirm your new Password' inputClassName='px-6 py-3 bg-gray-300 rounded-lg outline-none' value={passwordconfirm} onChange={(e)=>setPasswordConfirm(e.target.value)}/>
      </div>


      <div className='flex items-center space-x-4 mt-6'>
        <LoadingButton onClick={handleSubmit} isLoading={isLoading}>Change Password</LoadingButton>
        <Button variant='ghost'>
            <Link href="/auth/forgotpassword">
            Go Back
            </Link>
        </Button>
      </div>
    </div>
  )
}

export default ResetPassword
