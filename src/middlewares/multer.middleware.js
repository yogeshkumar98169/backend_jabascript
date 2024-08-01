import multer from "multer";


//file : function mein multer ke paas hi hota hai
//!cb : callback
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null,"./public/temp")    // we keep the file inside temp folder inside public
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname)  //see more options on docs
    }
})

export const upload = multer({ storage })


/**
 * at the end the storage function url de dega jhn server pe file store hui hai
 * fir yhn se url leke hum cloudinary pr upload kr denge
 * 
 cb(null,"./public/temp")    // we keep the file inside temp folder inside public
 */