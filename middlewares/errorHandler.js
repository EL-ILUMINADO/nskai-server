import multer from "multer";

const errorHandler = (err, req, res, next) => {
  console.error(err.stack);

  // Multer error
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res
        .status(400)
        .json({ message: "File too large. Maximum size is 5MB." });
    }
    return res.status(400).json({ message: err.message });
  }

  // Custom validation error
  if (err.message === "Only image files are allowed!") {
    return res.status(400).json({ message: err.message });
  }

  // Default error
  res.status(500).json({
    message: err.message || "Internal server error",
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
};

export default errorHandler;
