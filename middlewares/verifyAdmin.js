// middlewares/verifyAdmin.js
import userModel from "../models/userModel.js";

export const verifyAdmin = async (req, res, next) => {
  try {
    const user = await userModel.findById(req.userId);

    if (!user || user.role !== "admin" || !user.isAdminVerified) {
      return res.status(403).json({
        success: false,
        message: "Admin privileges required",
      });
    }

    // Attach user to req for controllers
    req.user = user;

    next();
  } catch (error) {
    res.status(500).json({ success: false, message: "Auth error" });
  }
};
