import express from "express";
import {
  login,
  logout,
  register,
  verifyEmail,
  forgotPassword,
  resetPassword,
  checkAuth,
  approveAdmin,
} from "../controllers/authController.js";
import { verifyToken } from "../middlewares/verifyToken.js";
import { reviewSubmission } from "../controllers/adminReviewController.js";
import isAdmin from "../middlewares/isAdmin.js";

const authRouter = express.Router();

// Check if user is authenticated
authRouter.get("/check-auth", verifyToken, checkAuth);

// Register user route
authRouter.post("/register", register);

// Login user route
authRouter.post("/login", login);

// Logout user route
authRouter.post("/logout", logout);

// VERIFY EMAIL
authRouter.post("/verify-email", verifyEmail);

// VERIFY ADMIN
authRouter.post("/approve-admin", approveAdmin);

// FORGOT PASSWORD
authRouter.post("/forgot-password", forgotPassword);

authRouter.post("/reset-password/:token", resetPassword);

// Approve/Reject a project submission
authRouter.put(
  "/submissions/:id/review",
  verifyToken,
  isAdmin,
  reviewSubmission
);

export default authRouter;
