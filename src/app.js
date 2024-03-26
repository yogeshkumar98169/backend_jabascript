import express from 'express'
import cors from "cors"
import cookieParser from 'cookie-parser'

const app = express()

app.use(cors(
    {
        origin: process.env.CORS_ORIGIN,
        credentials: true,
    }
))

//!pehle express json use nhi hota tha toh body parser use krna pdta tha 
app.use(express.json({
    limit:"16kb"                 // ! We have to add limit not to crash the server
}))

app.use(express.urlencoded({
    extended:true,     //!means ojbect ke andr object de skte ho
    limit:"16kb"
}))

app.use(express.static("public"))   //where we keep public assets, images, favicon etc.

app.use(cookieParser());

export { app }