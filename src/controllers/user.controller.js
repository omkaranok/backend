import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiErrors.js";
import {User} from "../models/user.models.js"
import {uploadOnCloudinary} from "../utils/cloudnairy.js"
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken"

const generateAccessAndRefreshTokens = async(userId)=>{
    try {
        const user=await User.findById(userId)
        const accessToken=user.generateAccessToken()
        const refreshToken=user.generateRefreshToken()

        user.refreshToken=refreshToken //user object ke ek property mai value daal rahe hai
        //Save works only when there is password 
        //to prevent that we use {validateBeforeSave}-->method
        await user.save({ validateBeforeSave:false }) //to save refresh token in data base //we are using here validateBeforeSave because mongoose model get kivkedin means password bhi chaye save hone ke pehle
        return { accessToken,refreshToken }           //to avoid mongoose kickin we need validateBeforeSave method kyuki if we don't receive emaul phir bhi save ho jaye

    } catch (error) {
        throw new ApiError(500,"Something went wrong while generating referesh and access token")
    }
}

const registerUser=asyncHandler(async(req,res)=>{
    // return res.status(200).json({
    //     message:"my first backend work"
    // })

    //get user details from frontend
    //validation -- not empty
    //check if user already exists:username,email
    //check for images,check for avatar
    //upload them to cloudinary,avatar
    //create user object - create entry in db
    //remove password and refresh token field from response
    //check for user creation
    //return response

    //if data is coming from form or direct from json we get from -->req.body

    const {fullName,email,username,password}=req.body
    // console.log("email",email); 

    // if( fullName === "" ){
    //     throw new ApiError(400,"fullname is required") //it is accepting status code and message 
    // }

    if(
        [fullName,email,username,password].some((field)=> 
        field?.trim() === "")  //some is predicate function here which accepts element,index and entire element as argument 
    ){                         //if any of these will get matched then it will return true and function stops execution
        throw new ApiError(400,"All fields are required")
    }

    const existedUser=await User.findOne({
        $or:[{username},{email}] //$or operator is used to check whether any of username,email is present in database or not
    })                           //If present will return true else false;;;;

    if(existedUser){
        throw new ApiError(409,"User with email or username alreay exists")
    }
    
    // console.log(req.files);
    //multer is used to add some field in request it is accessed by req.files given by multer not expreess
    const avatarLocalPath=req.files?.avatar[0]?.path;  //avatar[0] is object  //it gives local path 
    // const coverImageLocalPath=req.files?.coverImage[0]?.path;  //coverImage[0] acting as object which has propert called path which will give path
    
    let coverImageLocalPath;
    if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
        coverImageLocalPath = req.files.coverImage[0].path
    }
    
    if(!avatarLocalPath){
        throw new ApiError(400,"avatar is required")
    }

    const avatar=await uploadOnCloudinary(avatarLocalPath)
    const coverImage=await uploadOnCloudinary(coverImageLocalPath)
    
    if(!avatar){
        throw new ApiError(400,"avatar is required")
    }

    const user = await User.create({
        fullName,
        avatar: avatar.url,
        coverImage:coverImage?.url || "",
        email,
        password,
        username:username.toLowerCase()
    })
    
    //findById is method which takes user._id as parameter _id is given by mongoose itself
    //if it is true then it will execute else it will return false;

    //.select is method which takes which aragument has not to be sent in response
    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )

    if (!createdUser) {
        throw new ApiError(500, "Something went wrong while registering the user")
    }

    return res.status(201).json(
        new ApiResponse(200,createdUser,"User registered successfully")
    )

})

const loginUser=asyncHandler(async(req,res)=>{
    //req body -> data
    //username or email
    //find theuser
    //password check
    //access and referesh Token
    //send cookie 

     
    const {email, username, password} = req.body
    console.log(email);

    if (!username && !email) {
        throw new ApiError(400, "username or email is required")
    }
    
    // Here is an alternative of above code based on logic discussed in video:
    // if (!(username || email)) {
    //     throw new ApiError(400, "username or email is required")
        
    // }

    const user = await User.findOne({
        $or: [{username}, {email}]
    })

    if (!user) {
        throw new ApiError(404, "User does not exist")
    }

   const isPasswordValid = await user.isPasswordCorrect(password)

   if (!isPasswordValid) {
    throw new ApiError(401, "Invalid user credentials")
    }

   const {accessToken, refreshToken} = await generateAccessAndRefreshTokens(user._id)

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

    const options = {
        httpOnly: true,
        secure: true
    }

    return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
        new ApiResponse(
            200, 
            {
                user: loggedInUser, accessToken, refreshToken
            },
            "User logged In Successfully"
        )
    )

      
});

const logoutUser=asyncHandler(async(req,res)=>{
    //we have to remove cookie
    //we have to remove refreshToken
    // req.user._id
    await User.findByIdAndUpdate(
        req.user._id, //kiskop update krna hai 
        {
            $set:{
                refreshToken:undefined
            }      //$set is mongodb object  used for update

        },
        {
            new :true
        }
    )

    const options={
        httpOnly:true,
        secure:true
    }

    return res
    .status(200)
    .clearCookie("accessToken",options)
    .clearCookie("refreshToken",options)
    .json(new ApiResponse(200,{},"User logged out"))
})

const refreshAccessToken=asyncHandler(async(req,res)=>{
    const incomingRefreshToken=req.cookies.refreshToken || req.body.refreshToken

    if(!incomingRefreshToken){
        throw new ApiError(401,"UNAUTHORIZED REQUEST")
    }

    try {
        const decodedToken=jwt.verify(incomingRefreshToken,process.env.
            REFRESH_TOKEN_SECRET)
    
        //refreshtoken has been decoded now we can acces the _id property of jwt token 
        //and can call query using this _id in database to get user data    
    
        const user = await User.findById(decodedToken?._id)
        //if no user throw error invalid refersh token error
        
        if(!user){
            throw new ApiError(401,"Invalid refresh token")
        }
        //now to match user refreshtoken or incoming refresh token  with user?.refreshtoken
        
        if(incomingRefreshToken !== user?.refreshToken ){
            throw new ApiError(401,"Refresh token is expired or used")
        } 
    
        const options={
            httpOnly:true,
            secure:true
        }
    
        const {accessToken,newrefreshToken}=await generateAccessAndRefreshTokens(user._id)
    
        return res
        .status(200)
        .cookie("accessToken",accessToken,options)
        .cookie("refreshToken",newrefreshToken,options)
        .json(
            new ApiResponse(
                200,
                {accessToken,refreshToken:newrefreshToken},
                "Access token refreshed"
            )
        )
    } catch (error) {
        throw new ApiError(401,error?.message || "Invalid refresh token")
    }
})

export {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken
}