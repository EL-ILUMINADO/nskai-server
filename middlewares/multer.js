import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../configs/cloudinary.js";

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "bootcamp", // Folder in Cloudinary
    allowed_formats: ["jpg", "jpeg", "png", "webp"],
    transformation: [
      {
        width: 800,
        height: 600,
        crop: "fill",
        quality: "auto:good",
      },
    ],
  },
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed!"), false);
    }
  },
});

export default upload;
