import { useRouter } from 'next/navigation'
import React, { ChangeEvent, useEffect, useRef, useState } from 'react'
import { useDispatch } from 'react-redux'
import { Dialog, DialogContent, DialogHeader } from '../ui/dialog'
import { DialogTitle } from '@radix-ui/react-dialog'
import Image from 'next/image'
import LoadingButton from '../Helper/LodingButton'
import { Button } from '../ui/button'
import { ImageIcon } from 'lucide-react'
import { toast } from 'sonner'
import axios from 'axios'
import { BASE_URL } from '@/server'
import { handleAuthRequest } from '../utils/apiRequest'
import { addPost } from '@/store/postSlice'
type Props={
    isOpen:boolean
    onClose:()=>void
}
const CreatePostModel = ({isOpen,onClose}:Props) => {
    const router=useRouter()
    const dispatch=useDispatch()

    const [selectedImage,setSelectedImage]=useState<File | null>(null)
    const [previewImage,setPreviewImage]=useState<string | null>(null)
    const [caption,setCaption]=useState<string>("")
    const [isLoading,setIsLoading]=useState(false)

    const fileInputRef=useRef<HTMLInputElement | null >(null)

    useEffect(()=>{
        if(!isOpen){
            setSelectedImage(null)
            setPreviewImage(null)
            setCaption("")
        }
    },[isOpen])

    const handleButtonClick=()=>{
        if(fileInputRef.current){
            fileInputRef.current.click()
        }
    }

    const handleFileChange=(event:ChangeEvent<HTMLInputElement>)=>{
        if(event.target.files && event.target.files[0]){
            const file=event.target.files[0]

            if(!file.type.startsWith("image/")){
                toast.error("Please select a valid image file!")
                return
            }

            if(file.size>10*1024*1024){
                toast.error("File size should not exceed 10MB!")
            }

            const imageUrl=URL.createObjectURL(file)
            setSelectedImage(file)
            setPreviewImage(imageUrl)
        }
    }

    const handleCreatePost=async()=>{

        if(!selectedImage){
            toast.error("Please select an image to create a post!")
        }

        const formData=new FormData()
        formData.append("caption",caption)
        if(selectedImage){
        formData.append("image",selectedImage)
        }

        const createPostreq=async()=>await axios.post(`${BASE_URL}/posts/create-post`,formData,{withCredentials:true,headers:{"Content-Type":"multipart/form-data"},})

        const result=await handleAuthRequest(createPostreq,setIsLoading)

        if(result){
            dispatch(addPost(result.data.data.post))
            toast.success("Post created Successfully")
            setPreviewImage(null)
            setCaption("")
            setSelectedImage(null)
            onClose()
            router.push('/')
            router.refresh()
        }


    }


  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent>
            {previewImage? (
                <div className='flex flex-col items-center justify-center text-center space-y-4'>
                    <div className='mt-4'>
                        <Image src={previewImage} alt='image' width={400} height={400} className='overflow-auto max-h-96 rounded-md object-contain w-full'/>
                    </div>
                    <input type='text' value={caption} onChange={(e)=>setCaption(e.target.value)} placeholder='write a caption...' className="mt-4 border border-gray-300 rounded-md w-full px-4 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-600"/>
                    <div className='flex space-x-4 mt-4'>
                        <LoadingButton className='bg-blue-600 text-white hover:bg-blue-700' onClick={handleCreatePost} isLoading={isLoading}>Create Post  </LoadingButton>
                        <Button className='bg-gray-500 text-white hover:bg-gray-600' onClick={()=>{setPreviewImage(null);setSelectedImage(null);setCaption("") ;onClose();} }>Cancel</Button>
                    </div>
                </div>
            ):(
                <div>
                    <DialogHeader>
                        <DialogTitle className='text-center mt-3 mb-3'>Upload Photo</DialogTitle>
                    </DialogHeader>
                    <div className='flex flex-col items-center justify-center text-center space-y-4'>
                        <div className='flex space-x-2 text-gray-600'>
                            <ImageIcon size={40}/>
                        </div>
                        <p className='text-gray-600 mt-4'>
                            Select a photo from your device
                        </p>
                        <Button className='bg-blue-600 text-white hover:bg-blue-700' onClick={handleButtonClick}>Select from device</Button>
                        <input type='file' accept='image/*' className='hidden' ref={fileInputRef} onChange={handleFileChange}/>
                    </div>
                </div>
            )
            }
        </DialogContent>
    </Dialog>
  )
}

export default CreatePostModel
