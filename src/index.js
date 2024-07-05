// require('dotenv').config({path:'./env'}) //this how that as our app get opened it should first load env file as it is connecting databse
import dotenv from "dotenv"
import connectDB from "./db/index.js"
import app from "./app.js"


dotenv.config({
    path:'./env'  //alternative of do same as require('dotenv').config({path:'./env'})
})  //as the first file get opened it will get loaded


connectDB()
.then(()=>{
    app.listen(process.env.PORT || 8000,()=>{
        console.log(`Server is running at port : ${process.env.PORT}`);
    })
})
.catch((err)=>{
    console.log("MONGO db connection failed !!! ",err)
})
/*
const app = express()
 //DIRECT WAY TO CONNECT DATABASE IN INDEX FILE 
;( async () => {
    try{
        await mongoose.connect(`${process.env.MONGODB_URI}/$
            {DB_NAME}`)

        app.on("errror",(error)=>{    //.on is listner which can listen many error
            console.log("ERRR:",error);
            throw error
        })   
        
        app.listen(process.env.PORT,()=>{
            console.log(`App is listeining on port $
                {process.env.PORT}`);
        })
    }catch(error){
        console.log("ERROR",error) 
        throw err
    }
})()

*/