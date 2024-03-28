import { Router } from "express";
import { registerUser } from "../controllers/user.controller.js";

const router=Router()

router.route("/register").post(registerUser)
//!Here url is http://localhost:8000/api/v1/users/register pr register user hoga



export default router;