import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"

const app=express()

// app.use(cors()) configuration are done by this generatlly

//but we can also configure it who can acsess from frontend will access our backend

app.use(cors({
    origin:process.env.CORS_ORIGIN,
    credentials:true
}))
//app.use is used to configure and apply middlewares  
app.use(express.json({limit:"16kb"})) //this how we are accepting it in form of json

app.use(express.urlencoded({extended:true,limit:
    "16kb"
})) //it is use to acess data from url //extended show sthst we can give object inside ibject

app.use(express.static("public")) //it is used for keeping the files that are coming in public folder
//cookie -parser is used to access and set client browser cookies from server 
app.use(cookieParser())

//routes import
import userRouter from "./routes/user.routes.js"; //we can give any name when export default happen else not

//routes declaration
//we have to now use middleware to get route

//for sake of our ease we use "/user"---> by  "/api/v1/users"
app.use("/api/v1/users",userRouter) //it will send it to useRouter
//http://localhost:8000/users/register --> this will be our final url
//we may think that /user will be aur route yeh phir /register after userRouter method get executed "url" will be  
export default app;