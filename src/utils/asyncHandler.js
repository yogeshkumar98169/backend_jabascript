const asyncHandler = (requestHandler) => {
    (req, res, next) => {
        Promise.resolve(requestHandler(req, res, next)).catch((err) => {
            next(err);
        })
    }

}
    export { asyncHandler }


//!Promeise work can be done like that using async await
// const asyncHandler = (fn) => async (req, res, next) => {

//     try {
//         await fn(req,res,next);
//     } catch (err) {
//         res.status(err.code || 500).json({
//             success: false,
//             message:err.message
//         })
//     }
