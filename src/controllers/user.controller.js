import { asyncHandler } from "../utils/asyncHandler.js"
import {ApiError} from "../utils/ApiError.js"

//!We have 4 parameters err,req,res, next
const registerUser = asyncHandler(async (req, res) => {
   const{fullName, email,username, password}=req.body;
   console.log(email)
   console.log(fullName)
   if(fullName===""){
    throw new ApiError(400,"full name is required")
   }
})

export { registerUser }









/**
 * We tested this app first
 * !We have 4 parameters err,req,res, next
const registerUser = asyncHandler(async (req, res) => {
    //!here we also send status and then send json data like we don res.json()
    res.status(200).json(
        {
            message: "yogesh backend"
        }
    )
})
 */