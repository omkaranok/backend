import { Router } from "express";
import { registerUser,loginUser, logoutUser,refreshAccessToken } from "../controllers/user.controller.js";
import {upload} from "../middlewares/multer.middleware.js"
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router =Router()
//kis rote pe user ko le jana hai "/register" is route we will use post to regusteruser methood
router.route("/register").post(
    upload.fields([   //middleware multer ko use krke upload karenge 
        {
            name:"avatar", //first object
            maxCount:1
        },

        {
            name:"coverImage",  //second object
            maxCount:1
        }
    ]),
    registerUser //yeh method execute ho jata hai 
)

router.route("/login").post(loginUser)

//secured routes
router.route("/logout").post(verifyJWT,logoutUser) //roter confused kisko frst run kare
               //isliye next() was written in auth middleware verify mai likha hota toh logout run ho jayega

router.route("/refresh-token").post(refreshAccessToken)               
export default router
