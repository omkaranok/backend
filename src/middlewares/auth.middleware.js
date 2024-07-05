import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken"
import {User} from "../models/user.models.js"
import { ApiError } from "../utils/ApiErrors.js";

export const verifyJWT=asyncHandler(async(req,res,   //when there is no res taken as parameter in it will be replaced by _
next)=>{
    const token=req.cookies?.accessToken || req.header //from jwt token we receive Authorization:Bearer <Token>
    ("Authorization")?.replace("Bearer ","")

    if(!token){
        throw new ApiError(401,"Unauthorized request")
    }

    const decodedToken=jwt.verify(token,process.env.
    ACCESS_TOKEN_SECRET)

    const user = await User.findById(decodedToken?._id).select(
        "-password -refreshToken"
    )

    if(!user){
        throw new ApiError(401,"Invalid Access Token")
    }

    //we are adding new  in req
    req.user=user;
    next()
})