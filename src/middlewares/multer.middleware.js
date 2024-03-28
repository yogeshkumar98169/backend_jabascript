import multer from "multer";

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null,"./public/temp")    // we keep the file inside temp folder inside public
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname)  //see more options on docs
    }
})

export const upload = multer({ storage })