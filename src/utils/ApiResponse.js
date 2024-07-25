//response ke liye hum  express use kr rhe hain jese res.send like
//!so we will make our own class as pehle se koi class available nhi hai humare paas jisko hum extend kr ske
class ApiResponse {
    constructor(statusCode, data, message = "Success") {
        this.statusCode = statusCode
        this.data = data
        this.message = message
        this.success = statusCode < 400   
    }
}

export { ApiResponse }

/**
 * status code is less that 400 because 
 * !400 se uper client error server error 
 * NOTE : remember to see status code in docs on internet
 */