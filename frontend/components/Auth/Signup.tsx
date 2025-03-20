'use client'
import Image from 'next/image'
import React, { ChangeEvent, FormEvent, useState } from 'react'
import image from '../../public/image.png'
import PasswordInput from './PasswordInput'
import LodingButton from '../Helper/LodingButton'
import Link from 'next/link'
import { BASE_URL } from '@/server'
import axios from 'axios'
import { handleAuthRequest } from '../utils/apiRequest'
import { toast } from 'sonner'
import { useDispatch, useSelector } from 'react-redux'
import { setAuthUser } from '@/store/authSlice'
import { useRouter } from 'next/navigation'

interface FormData {
  username: string
  email: string
  password: string
  passwordconfirm: string
}

const Signup = () => {
  const dispatch=useDispatch()
  const router=useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState<FormData>({
    username: '',
    email: '',
    password: '',
    passwordconfirm: '',
  })

  const handleChange = (e: ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
  
    const signupreq = async () => {
      return await axios.post(`${BASE_URL}/users/signup`, formData, { withCredentials: true });
    };
  
    const result = await handleAuthRequest(signupreq, setIsLoading);
  
    console.log("API Response:", result); 
  
    if (result && result.data) {
      toast.success(result.data.message);
      dispatch(setAuthUser(result.data.data.user))

      router.push("/auth/verify")
    } else {
      console.log("Signup failed, no response data.");
    }
  };
  

  return (
    <div className='w-full h-screen overflow-hidden'>
      <div className='grid grid-cols-1 lg:grid-cols-7 gap-8'>
        <div className='lg:col-span-4 h-screen hidden lg:block'>
          <Image
            src={image}
            alt='signup'
            width={1000}
            height={1000}
            className='w-full h-full object-cover'
          />
        </div>

        <div className='lg:col-span-3 flex flex-col items-center justify-center h-screen'>
          <h1 className='font-bold text-xl sm:text-2xl text-left uppercase mb-8'>
            SIGN UP WITH <span className='text-rose-600'>ABHIGRAM</span>
          </h1>
          <form
            onSubmit={handleSubmit}
            className='block w-[90%] sm:w-[80%] md:w-[60%] lg:w-[90%] xl:w-[80%]'
          >
            <div className='mb-4'>
              <label htmlFor='name' className='font-semibold mb-2 block'>
                Username
              </label>
              <input
                type='text'
                name='username'
                placeholder='Username'
                className='px-4 py-3 bg-gray-200 rounded-lg w-full block outline-none'
                value={formData.username}
                onChange={handleChange}
              />
            </div>

            <div className='mb-4'>
              <label htmlFor='email' className='font-semibold mb-2 block'>
                Email
              </label>
              <input
                type='email'
                name='email'
                placeholder='Email'
                className='px-4 py-3 bg-gray-200 rounded-lg w-full block outline-none'
                value={formData.email}
                onChange={handleChange}
              />
            </div>

            <div className='mb-4'>
              <PasswordInput
                label='Password'
                name='password'
                palceholder='Enter password'
                value={formData.password}
                onChange={handleChange}
              />
            </div>

            <div>
              <PasswordInput
                name='passwordconfirm'
                label='Confirm Password'
                palceholder='Confirm Password'
                value={formData.passwordconfirm}
                onChange={handleChange}
              />
            </div>

            <LodingButton
              size={'lg'}
              className='w-full mt-8'
              type='submit'
              variant='default'
              isLoading={isLoading}
            >
              SIGN UP NOW
            </LodingButton>
          </form>

          <h1 className='mt-4 text-lg text-gray-800'>
            Already have an account?{' '}
            <Link href='/auth/login'>
              <span className='text-blue-800 underline cursor-pointer font-medium'>
                Login Here
              </span>
            </Link>
          </h1>
        </div>
      </div>
    </div>
  )
}

export default Signup
