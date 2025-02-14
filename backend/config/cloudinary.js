import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";
import streamifier from "streamifier";

dotenv.config();

// Cloudinary Configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const uploadToCloudinary = async (fileBuffer, fileName) => {
  return new Promise((resolve, reject) => {
    const uniquePublicId = `Genoviq_${Date.now()}_${Math.random().toString(36).substring(7)}`; // Generate Unique ID

    const stream = cloudinary.uploader.upload_stream(
      { public_id: uniquePublicId, resource_type: "auto" },
      (error, result) => {
        if (error) return reject(error);

        // Generate Optimized URLs
        const optimizeUrl = cloudinary.url(result.public_id, {
          fetch_format: "auto",
          quality: "auto",
        });

        const autoCropUrl = cloudinary.url(result.public_id, {
          crop: "auto",
          gravity: "auto",
          width: 500,
          height: 500,
        });

        resolve({
          url: result.secure_url,
          optimizedUrl: optimizeUrl,
          croppedUrl: autoCropUrl,
        });
      }
    );

    // Convert Buffer to Stream and Pipe it to Cloudinary
    streamifier.createReadStream(fileBuffer).pipe(stream);
  });
};
