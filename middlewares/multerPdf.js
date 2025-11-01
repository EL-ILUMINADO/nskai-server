import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../configs/cloudinary.js";

// Cloudinary: store PDFs as raw files
const pdfStorage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    const bootcampId = req.params.id; // from route /bootcamps/:id/submit-project
    const projectNumber = req.body.projectNumber || "x";
    return {
      folder: `bootcamp/projects/${bootcampId}`,
      resource_type: "raw", // <— IMPORTANT for PDFs
      format: "pdf",
      public_id: `${req.userId}-project${projectNumber}-${Date.now()}`,
    };
  },
});

const pdfOnly = (req, file, cb) => {
  if (file.mimetype === "application/pdf") return cb(null, true);
  cb(new Error("Only PDF files are allowed!"), false);
};

const uploadProjectPdf = multer({
  storage: pdfStorage,
  fileFilter: pdfOnly,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
});

export default uploadProjectPdf;
