import multer from "multer"


const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, "./public/temp")
    },
    filename: function (req, file, cb) {   //filename is method which is used to generate unique name of file 
      cb(null, file.originalname) //it keep file on server for very short duration of time because that's we
    } //don't have to take tension about overwriting of file 
})

export const upload = multer({ 
    storage: storage 
}) 

