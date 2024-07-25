//we need this file so that when we want async promise handling it can be directly use
//it can be used in multiple place while talking to api
const asyncHandler = (requestHandler) => {
    return (req, res, next) => {
        Promise.resolve(requestHandler(req, res, next)).catch((err) => {
            next(err);
        })
    }

}
export { asyncHandler }


//!Promise work can be done like that using async await

// const asyncHandler=()=>{}
// const asyncHandler=(func)=>()=>{}
// const asyncHandler=(func)=>async()=>{}
// const asyncHandler = (fn) => async (req, res, next) => {
//     try {
//         await fn(req,res,next);
//     } catch (err) {
//         res.status(err.code || 500).json({
//             success: false,
//             message:err.message
//         })
//     }
