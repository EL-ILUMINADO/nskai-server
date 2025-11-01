import cloudinary from "../configs/cloudinary.js";

// Helper function to delete image from Cloudinary
export const deleteImageFromCloudinary = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (error) {
    console.error("Error deleting image from Cloudinary:", error);
    throw error;
  }
};

// Helper function to upload image to Cloudinary
export const uploadImageToCloudinary = async (
  filePath,
  folder = "bootcamp-images"
) => {
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      folder: folder,
      transformation: [
        {
          width: 800,
          height: 600,
          crop: "fill",
          quality: "auto:good",
        },
      ],
    });
    return result;
  } catch (error) {
    console.error("Error uploading image to Cloudinary:", error);
    throw error;
  }
};
