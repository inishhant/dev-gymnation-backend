import multer from "multer";

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, './public/temp')
    },
    filename: function (req, file, cb) {
      cb(null, `${file.originalname}${Math.floor(Math.random()*100)}`)
    }
  })
  
export const upload = multer({ storage: storage })