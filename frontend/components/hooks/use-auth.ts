import { BASE_URL } from "@/server"
import axios from "axios"
import { useDispatch } from "react-redux"
import { handleAuthRequest } from "../utils/apiRequest"
import { setAuthUser } from "@/store/authSlice"
import { toast } from "sonner"

export const useFollowUnfollow=()=>{
    const dispatch=useDispatch()

    const handleFollowUnfollow=async(userId:string)=>{
        const followUnfollowreq=async()=>
            await axios.post( `${BASE_URL}/users/follow-unfollow/${userId}`, {},{ withCredentials: true })

        const result= await handleAuthRequest(followUnfollowreq)

        if(result?.data.status == "success"){
            dispatch(setAuthUser(result.data.data.user))
            toast.success(result.data.message)
        }
    }

    return {handleFollowUnfollow}
}