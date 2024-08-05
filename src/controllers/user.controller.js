import { asyncHandler } from "../utils/asyncHandler.js"
import {ApiError} from "../utils/ApiError.js"
import {User} from "../models/user.model.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js"

//!We have 4 parameters err,req,res, next

const generateAccessAndRefreshTokens=async(userId)=>{
    try{
        const user=await User.findById(userId)
        const accessToken=user.generateAccessToken()
        const refreshToken=user.generateRefreshToken()
        user.refreshToken=refreshToken           //put refresh token in user object in database
        user.save({validateBeforeSave:false});                             //now save user object
        //!when we save it password bhi hona hi cahiye us time so we use {validatebeforesave:false}-> means ki validate mt karo save kr do

        return  {accessToken, refreshToken}
    }
    catch(error){
        throw new ApiError(500,"Something went wrong while generating refresh and access token")
    }
}


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

    /*
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
    console.log(req.files)
    const avatarLocalPath=req.files?.avatar[0]?.path
    //[0] se hi lete hai -> conditionally check because file ho bhi skti hai ya nhi
    // const coverImageLocalPath=req.files?.coverImage[0]?.path   //!undefinded bhi ho skta hai
    //!to solve this use classic if else
    let coverImageLocalPath;
    if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length>0){
        coverImageLocalPath=req.files?.coverImage[0]?.path
    }

    //!Cloudinary return empty string if no value given to file
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
    const createdUser=await User.findById(user._id).select("-password -refreshToken");

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



/**
 * req body -> data le aao
 * username or email hai ya nhi
 * find the user in database
 * if user found password check karo
 * authentication true, generate access and refresh token
 * send them in cookies
 * response bhej do successfully logged in
 */


const loginUser=asyncHandler(async(req,res)=>{
        const {email, username,password}=req.body
        console.log(email)
        if(!email && !username){
            throw new ApiError(400,"Username or email is required")
        }
        //write one if you want to find using one other use query like this
        const user=await User.findOne({
            $or :[{username},{email}]
        })

        if(!user){
            throw new ApiError(404,"User doesn't exist")
        }
        //User ke pass mongooose ke hi method honge jo humne khud bnaye hain model mein wo jo humne liya hai data usse milenge
        const isPasswordValid=await user.isPasswordCorrect(password)

        if (!isPasswordValid) { 
            throw new ApiError(401, "Invalid user credentials")
        }

        //!make access and refresh token
        const {accessToken,refreshToken }=await generateAccessAndRefreshTokens(user._id)

        //ye humne toh bnaya becuase jb pehle bnaya tha tb token nhi the document mein
        //the only thing we should do is to check ki ye expensive toh nhi hoga -> if expensive document update kr do na ki query maaro
        const loggedInUser=await User.findById(user._id).select("-password -refreshToken")
        

        //send token in cookies
        
        const options={
            httpOnly:true,
            secure: true,
            // httpOnly and secure true because cookies frontend pe change kr skte hain so we want ki server se hi modify kr ske so we do it true
        }

        return res
        .status(200)
        .cookie("accessToken",accessToken, options)
        .cookie("refreshToken",refreshToken,options)
        .json(
            new ApiResponse(200,
                {
                    user:loggedInUser,accessToken, refreshToken
                    // we send it because syd koi mobileapplicatoin develop kr rha hao whn toh cookies set nhi honge
                },
                "user logged in successfully"
            ) 
        )
})

const logoutUser=asyncHandler(async(req,res)=>{
    /**
     * req.user se data le aao jo middle weare se dala hai
     * cookies se token htao
     * database se bhi token hta do
     */
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set:{
                refreshToken:undefined
            }
        },
        {
            new :true        //jo update value hai vo aayegi ab
        }
    )

    const options = {
        httpOnly: true,
        secure: true,
    }
    return res
    .status(200)
    .clearCookie("accessToken",options)
    .clearCookie("refreshToken",options)
    .json(new ApiResponse(200,{},"User logged Out successfully"))
})



export { registerUser,loginUser,logoutUser }





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