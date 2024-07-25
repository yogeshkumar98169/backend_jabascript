//We make this file, because we want to see our error in our own formation discussed below
//!error ke liye already class available hai node js mein
class ApiError extends Error {
    constructor(
        statusCode,
        message = "Something went wrong",
        errors = [],
        stack = ""
    ) {
        super(message)
        this.statusCode = statusCode
        this.data = null
        this.message = message
        this.success = false;   
        this.errors = errors
        

        //stack : give us information how the error occurs
        if (stack) {
            this.stack = stack      
        } else {
            Error.captureStackTrace(this, this.constructor)
        }

    }
}

export { ApiError }