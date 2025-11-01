import express from "express";
import {
  createBootcamp,
  deleteBootcamp,
  getBootcamps,
  getSingleBootcamp,
  updateBootcamp,
  updateBootcampStatus,
} from "../controllers/bootcampController.js";
import { verifyToken } from "../middlewares/verifyToken.js";
import { verifyAdmin } from "../middlewares/verifyAdmin.js";
import upload from "../middlewares/multer.js";
import { registerForBootcamp } from "../controllers/bootcampRegistrationController.js";
import {
  getMySubmissionsForBootcamp,
  submitProject,
} from "../controllers/projectSubmissionController.js";
import uploadProjectPdf from "../middlewares/multerPdf.js";
import isAdmin from "../middlewares/isAdmin.js";

const bootCampRouter = express.Router();

bootCampRouter.get("/", getBootcamps);

// GET single bootcamp
bootCampRouter.get("/:id", getSingleBootcamp);

bootCampRouter.post(
  "/",
  verifyToken,
  verifyAdmin,
  upload.single("coverImage"),
  createBootcamp
);

// Update bootcamp
bootCampRouter.put(
  "/:id",
  verifyToken,
  verifyAdmin,
  upload.single("coverImage"),
  updateBootcamp
);

bootCampRouter.delete("/:id", verifyToken, verifyAdmin, deleteBootcamp);

bootCampRouter.post("/:id/register", verifyToken, registerForBootcamp);

// Submit a project PDF (projectNumber in body: 1 or 2)
bootCampRouter.post(
  "/:id/submit-project",
  verifyToken,
  uploadProjectPdf.single("file"), // form field name must be "file"
  submitProject
);

// Get my submissions for this bootcamp (to show status on the page)
bootCampRouter.get(
  "/:id/my-submissions",
  verifyToken,
  getMySubmissionsForBootcamp
);

// Update a bootcamp's active status
bootCampRouter.put("/:id/status", verifyToken, isAdmin, updateBootcampStatus);

export default bootCampRouter;
