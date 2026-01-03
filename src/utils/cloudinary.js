/*import {v2 as cloudinary} from "cloudinary"
import fs from "fs"

cloudinary.config({ 
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
        api_key: process.env.CLOUDINARY_API_KEY, 
        api_secret: process.env.CLOUDINARY_API_SECRET
    });*/

import { v2 as cloudinary } from "cloudinary";
import fs from "fs";


cloudinary.config({
    cloud_name:"drgelm2mv",
    api_key:"826843765475866",
    api_secret:"YeDOI3iHFuor43gM1D5fM4hkUpU"
});



const uploadOnCloudinary = async (localFilePath) => {
    try{
        if (!localFilePath) return null
        //upload the file on cloudinary
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto"
        })
        //file has been uploaded successfull
        console.log("file is uploaded on cloudinary",response.url);
        return response;
    } catch (error) {
        //fs.unlinkSync(localFilePath)  //remove locally saved temporary file as upload operation got failed
        //return null;
        console.error("=== CLOUDINARY DEBUG ===");
    console.error("Error full object:", error);  // Full error (e.g., { message: 'Invalid signature', httpcode: 401 })
    console.error("Local file path:", localFilePath);  // Verify path exists
    console.error("Cloudinary config keys present:", !!process.env.CLOUDINARY_CLOUD_NAME);  // True/False check
    console.error("======================");

    // ... your unlink code
    throw new Error(`Upload failed: ${error.message}`);
    }
}

export{uploadOnCloudinary}