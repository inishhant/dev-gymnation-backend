import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';
import dotenv from 'dotenv';
dotenv.config();

cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret: process.env.CLOUDINARY_API_SECRET 
});

const uploadOnCloudinary = async (localFilePath) => {
    try {
       if(localFilePath) {
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto"
        })
        console.log("File is uploaded on cloudinary: ",response.url)
        fs.unlinkSync(localFilePath); // remove the local save file after loaded on cloudinary
        return response;
       }
    } catch(error) {
       fs.unlinkSync(localFilePath); // remove the local save file
       return null;
    }
}

export { uploadOnCloudinary }