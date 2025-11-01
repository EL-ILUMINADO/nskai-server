import express from "express";
import { verifyToken } from "../middlewares/verifyToken.js";
import isAdmin from "../middlewares/isAdmin.js";
import { reviewSubmission } from "../controllers/adminReviewController.js";

const adminRouter = express.Router();

adminRouter.put(
  "/submissions/:id/review",
  verifyToken,
  isAdmin,
  reviewSubmission
);

export default adminRouter;
