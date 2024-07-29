import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import dotenv from "dotenv";
dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const getPublicIdAndResourceTypeFromUrl = (url) => {
  const urlObject = new URL(url);
  const parts = urlObject.pathname.split("/");

  const resourceType = parts[2]; // "image" or "video"
  const publicIdWithExtension = parts.slice(5).join("/").split(".")[0]; // Get the public ID from the URL path

  return { publicId: publicIdWithExtension, resourceType };
};

const uploadOnCloudinary = async (localFilePath) => {
  try {
    if (localFilePath) {
      const response = await cloudinary.uploader.upload(localFilePath, {
        resource_type: "auto",
      });
      console.log("File is uploaded on cloudinary: ", response.url);
      fs.unlinkSync(localFilePath); // remove the local save file after loaded on cloudinary
      return response;
    }
  } catch (error) {
    fs.unlinkSync(localFilePath); // remove the local save file
    return null;
  }
};

const deleteFromCloudinary = async (url) => {
  const { publicId, resourceType } = getPublicIdAndResourceTypeFromUrl(url);
  console.log("publicId: ", publicId);
  console.log("resourceType: ", resourceType);

  try {
    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType,
    });
    console.log("Delete result:", result);
  } catch (error) {
    console.error("Error deleting asset:", error);
  }
};

export { uploadOnCloudinary, deleteFromCloudinary };
