import { asyncHandler } from "../utils/asyncHandler.js"
import {ApiError} from "../utils/ApiError.js"
import {User} from "../models/user.model.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js"

//!We have 4 parameters err,req,res, next


/**
 * Now what we do next
 * get userDetails from frontend : username, email, fullname, avtar,    coverimage, password
    //validataion : correct format, empty or not
    //check if user already exist: check by username, email or by one
    //check if images , check for avtar, cover image hai toh bhi thik hai mhi toh bhi
    //upload image to cloudinary
    // check avtar uploaded to cloudinary or not
    //create user object-> because mongoDB noSQL hai toh object hi bnate hain -> create entry in db
    //remove password and refresh token field from response -> because we don't want user ko encrypted password or refresh token pta lge
    //!check for user creation
    //return response else error bhej do
 */
const registerUser = asyncHandler(async (req, res) => {
    //!refresh token hum hi denge app se
    //!watch history bhi hum hi bnayenge programmatically
    //!cover image isn't required
    //!avtar hum routes mein le rhe hain
   const{fullName, email,username, password}=req.body;
   console.log(email)
   console.log(fullName)
   console.log(req.body)   //!it will return what we send in the body of the testing or what came from frontend
/** 
    if(fullName===""){
    throw new ApiError(400,"full name is required")
    }
    
    Write all seperately or
    use the below code
*/

    if(
        [fullName,email,username, password].some((field)=>field?.trim==="")
    ){
        throw new ApiError(400,"All fields are required")
    }

    // User.findOne({email})  //! when we have to search it using one parameter
    //Using two parameter : it will return first document matching the user
    const existedUser= await User.findOne({
        $or:[{ username }, { email }]
    })
    if(existedUser){
        throw new ApiError(409,"User with email and username already registered")
    }
    //ho skta hai files ka access hai ya nhi toh //!conditionally check karo
    //!we want file first property avtar ki then uska path 
    //do it conditionally so that if not present don't make error
    const avatarLocalPath=req.files?.avatar[0]?.path
    //[0] se hi lete hai -> conditionally check because file ho bhi skti hai ya nhi
    const coverImageLocalPath=req.files?.coverImage[0]?.path

    //avatar :required field so check aaya hai ki nhi
    //cover file: not required aaye toh bhi thik na aaye toh bhi thik
    //now check avatar gya hai ki ni because avatar is a required field nhi gya hoga toh database error dega
    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar file is requited")
    }


    //upload file to cloudinary
    const avatar=await uploadOnCloudinary(avatarLocalPath)
    const coverImage=await uploadOnCloudinary(coverImageLocalPath)

    
    //!Dataabse se baat krte samay time lg skta hai and database is in another continent
    const user=await User.create({
        fullName,
        avatar:avatar.url,
        coverImage:coverImage?.url || "",
        email,
        password,
        username:username.toLowerCase()
    })

    //check userCreated +
    //Remove password and refresh token from the response 
    /*
    By default sbhi field select hoti hai select mein
    But to remove some fields use [-sign with the field name] to exclude
     */
    const createdUser=User.findById(user._id).select("-password -refreshToken");

    //user nhi bna user ne toh sb bhej diya humare server mein dikkat aayi 500 code
    if(!createdUser){
        throw new ApiError(500,"Something went wrong while registering a user")
    }
    
    //now return response with creatin a object of API response class
    //!if we want to send data we can make object in json
    return res.status(201).json(
        new ApiResponse(200,createdUser,"User Created Successfully")
    )
    
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