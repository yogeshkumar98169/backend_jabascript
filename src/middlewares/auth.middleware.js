import { ApiError } from "../utils/ApiError.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import jwt from "jsonwebtoken"
import { User } from "../models/user.model.js"


// YOu can also use _ in place of res and req if not used
export const verityJWT=asyncHandler(async(req,res,next)=>{
    try {
        /**
         * first get token 
         * check it is correct or not using jwt and decode information
         * get user from model and get the docuemnt by username or data from decode
         */
        const token =req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ","")

        console.log(token)
    
        if(!token){
            throw new ApiError(401,"Unauthorized request")
        }
        
        const decodedToken=jwt.verify(
            token,
            process.env.ACCESS_TOKEN_SECRET
        )
    
        const user = await User.findById(decodedToken?._id).select("-password -refreshToken")   //because jb model bnaya tha tb generate kiya tha tb _id se hi di thi id
    
        if(!user){
            // NEXT_VIDEO: discuss about frontend
            throw new ApiError(401,"Invalid access token")
        }
    
        req.user=user;   //send nhi kiya jo req hai uske user main user ko add kr diya
        next();
    } catch (error) {
        throw new ApiError(401,error?.message||"Invalid Access Token")
    }
    
})









/**
 * const token =req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ","")
 * In the above code before || this is simple access through cookies but after that jb hum mobile mein kr rhe hai tb cookies nhi aayega toh whn //!authorization hota hai usme value hoti hai
 * !Authorization : Bearer <token>
 */