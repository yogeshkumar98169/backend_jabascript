import { asyncHandler } from "../utils/asyncHandler.js"

//!We have 4 parameters err,req,res, next
const registerUser = asyncHandler(async (req, res) => {
    //!here we also send status and then send json data like we don res.json()
    res.status(200).json(
        {
            message: "yogesh backend"
        }
    )
})

export { registerUser }