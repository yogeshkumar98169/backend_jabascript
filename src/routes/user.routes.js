import { Router } from "express";
import { registerUser } from "../controllers/user.controller.js";
import {upload} from "../middlewares/multer.middleware.js"
const router=Router()

router.route("/register").post(
    upload.fields([
        {
            name : "avatar",
            maxCount:1       //how much files will be accepted
        },
        {
            name:"coverImage",
            maxCount:1
        }
    ]),
    registerUser)
//!Here url is http://localhost:8000/api/v1/users/register pr register user hoga



export default router;