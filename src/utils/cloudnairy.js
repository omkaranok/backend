import { v2 as cloudinary } from 'cloudinary';
import fs from "fs";



cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret: process.env.CLOUDINARY_API_SECRET // Click 'View Credentials' below to copy your API secret
});

const uploadOnCloudinary = async(localFilePath)=>{
    try{
        if(!localFilePath) return null
        //upload the file on cloudinary
        const response=await cloudinary.uploader.upload(localFilePath,{
            resource_type:"auto"   //clodinary ka methoh hota hai khud dtect krlo kaun sa file aa rha hai
        });
        //file has been uploaded successfully
        console.log("file is uploaded on cloudinary",
            response.url);
        fs.unlinkSync(localFilePath) //upload hone ke baad unlink kar do bro
        return response;    //upload hine ke baad ka public url //we are here sending entire response
    }catch(error){
        fs.unlinkSync(localFilePath) //remove the locally saved temporary file as the upload opeartion gets failed
        return null;
    }

}

export {uploadOnCloudinary}