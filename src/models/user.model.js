import jwt from "jsonwebtoken"
import bcrypt from 'bcrypt'
const userSchema = new Schema({
    id: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        index: true            //!kisi bhi field ko searchable banana toh index true kr do 
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
    },
    fullName: {
        type: String,
        required: true,
        trim: true,
        index: true
    },
    avatar: {
        type: String,        //cloudinary url
        required: true,
    },
    coverImage: {
        type: String,        //cloudinary url ho toh bhi thik hai nhi ho toh bhi thik hai
    },
    watchHistory: [
        {
            type: Schema.Types.ObjectId,
            ref: "Video"
        }
    ],
    passwords: {
        type: Stirng,
        required: [true, "Password is required"],
    },
    refreshToken: {
        type: String
    }
}, { timestamps: true })

//!here we don't use arrow function because this ka reference nhi hota uske paas
//!async because algorithm of encryption takes time
//!take next because pre is a middleware
//!this function will run everytime we save anything so we have to add condition ki jb password change ho tbhi change ho
userSchema.pre("save", async function (next) {
    //!yhn password field string mein hi pass krna pdta hai
    if (!this.isModified("password")) {
        return next();
    }
    this.password = bcrypt.hash(this.password, 10)
    next()
})

//!is method mein jitne cahe methods add kr do 
//!password check krna hai ki shi hai ki ni
userSchema.methods.isPasswordCorrect = async function (password) {
    return await bcrypt.compare(password,this.password)
}

//!arrow function tbhi use nhi kiya kunki hume cahiye ki this ka access ho 
userSchema.methods.generateAccessToken=function(){
    return jwt.sign(
        {
            id:this.id,                  // ye hume apne database se mil hi jaegi
            email:this.email,            // ye bhi hume database se mil hi jaegi
            username:this.username,
            fullName:this.fullName
        }, 
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_SECRET
        }
    )
}
userSchema.methods.generateRefreshToken=function(){
    //!refresh token baar baar refresh hota hai tbhi hum isme km information hota hai
    return jwt.sign(
        {
            id: this.id,                  // ye hume apne database se mil hi jaegi
        }, process.env.REFRESH_TOKEN_SECRET, {
        expiresIn: process.env.REFRESH_TOKEN_EXPIRY
    }
    )
}

export const User = model("User", userSchema)