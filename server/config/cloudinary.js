import dotenv from "dotenv";
dotenv.config();


import { v2 as cloudinary } from "cloudinary";

console.log("CLOUD FILE ENV:", process.env.CLOUD_NAME);
console.log("API KEY:", process.env.CLOUD_API_KEY);
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
  
});

export default cloudinary;