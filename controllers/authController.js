import bcrypt from "bcryptjs";
import crypto from "crypto";

import userModel from "../models/userModel.js";

import { generateTokenAndSetCookie } from "../utils/generateTokenAndSetCookie.js";
import {
  sendPasswordResetEmail,
  sendResetSuccessEmail,
  sendVerificationEmail,
  sendWelcomeEmail,
} from "../mailtrap/emails.js";

// REGISTER NEW USER
// export const register = async (req, res) => {
//   const { fullname, email, password } = req.body;

//   if (!fullname || !email || !password) {
//     return res
//       .status(400)
//       .json({ success: false, message: "Please fill in the required fields." });
//   }

//   try {
//     const existingUser = await userModel.findOne({ email });

//     if (existingUser) {
//       return res
//         .status(400)
//         .json({ success: false, message: "User already exists." });
//     }

//     const hashedPassword = await bcrypt.hash(password, 12);
//     const verificationToken = Math.floor(
//       100000 + Math.random() * 900000
//     ).toString();

//     const user = new userModel({
//       fullname,
//       email,
//       password: hashedPassword,
//       verificationToken,
//       verificationTokenExpiresAt: Date.now() + 24 * 60 * 60 * 1000,
//     });

//     await user.save();

//     // JWT TOKEN

//     generateTokenAndSetCookie(res, user._id);

//     // SEND VERIFICATION EMAIL TO USER
//     // Send verification email (only in production)
//     if (process.env.NODE_ENV === "production") {
//       await sendVerificationEmail(user.email, verificationToken);
//     } else {
//       console.log(`📩 Your verification code is: ${verificationToken}`);
//     }

//     return res.status(201).json({
//       success: true,
//       message: "User account created successfully.",
//       user: {
//         ...user._doc,
//         password: null,
//       },
//     });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

export const register = async (req, res) => {
  const { fullname, email, password, role } = req.body;

  if (!fullname || !email || !password) {
    return res
      .status(400)
      .json({ success: false, message: "Please fill in the required fields." });
  }

  try {
    const existingUser = await userModel.findOne({ email });
    if (existingUser) {
      return res
        .status(400)
        .json({ success: false, message: "User already exists." });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const verificationToken = Math.floor(
      100000 + Math.random() * 900000
    ).toString();

    const user = new userModel({
      fullname,
      email,
      password: hashedPassword,
      role: role || "user", // default user if not specified
      verificationToken,
      verificationTokenExpiresAt: Date.now() + 24 * 60 * 60 * 1000,
      isAdminVerified: role === "admin" ? false : true, // mark admin as pending verification
    });

    await user.save();

    // JWT token (they still get a session, but limited if admin not verified)
    generateTokenAndSetCookie(res, user._id);

    if (role === "admin") {
      // STEP 1: Send OTP to company's email (not the user’s email)
      const companyEmail = process.env.COMPANY_EMAIL; // see this in .env
      if (process.env.NODE_ENV === "production") {
        await sendAdminApprovalEmail(companyEmail, {
          fullname,
          email,
          verificationToken,
        });
      } else {
        console.log(
          `📩 Admin approval code for ${email}: ${verificationToken}`
        );
      }

      return res.status(201).json({
        success: true,
        message:
          "Admin signup request sent. Await company approval before activation.",
        user: {
          ...user._doc,
          password: null,
        },
      });
    } else {
      // Normal user → send verification to their own email
      if (process.env.NODE_ENV === "production") {
        await sendVerificationEmail(user.email, verificationToken);
      } else {
        console.log(`📩 Your verification code is: ${verificationToken}`);
      }

      return res.status(201).json({
        success: true,
        message: "User account created successfully.",
        user: {
          ...user._doc,
          password: null,
        },
      });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// APPROVE ADMIN
export const approveAdmin = async (req, res) => {
  const { email, verificationToken } = req.body;

  if (!email || !verificationToken) {
    return res.status(400).json({
      success: false,
      message: "Email and verification token are required.",
    });
  }

  try {
    // Find user who registered as admin but not yet verified
    const user = await userModel.findOne({
      email,
      role: "admin",
      verificationToken,
      verificationTokenExpiresAt: { $gt: Date.now() }, // still valid
      isAdminVerified: false,
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired token, or admin not found.",
      });
    }

    // Approve admin
    user.isAdminVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpiresAt = undefined;

    await user.save();

    return res.status(200).json({
      success: true,
      message: "Admin approved successfully. They now have admin privileges.",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// VERIFY USER'S EMAIL
export const verifyEmail = async (req, res) => {
  const { code } = req.body;

  try {
    const user = await userModel.findOne({
      verificationToken: code,
      verificationTokenExpiresAt: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired verification code",
      });
    }

    user.isAccountVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpiresAt = undefined;

    await user.save();

    await sendWelcomeEmail(user.email, user.fullname);
    res.status(201).json({
      success: true,
      message: "Email verified successfully",
      user: {
        ...user._doc,
        password: null,
      },
    });
  } catch (error) {
    console.log("Error verifying email", error);
    res.status(500).json({ success: false, message: "Error verifying email." });
  }
};

// USER LOGIN
export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await userModel.findOne({ email });

    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid credentials" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid password" });
    }

    generateTokenAndSetCookie(res, user._id, user.role);

    user.lastLogin = new Date();
    await user.save();

    res.status(200).json({
      success: true,
      message: "Logged in successfully",
      user: {
        ...user._doc,
        password: undefined,
      },
    });
  } catch (error) {
    console.log("Error logging user in.", error);
    res.status(400).json({ success: false, message: "Error logging user in" });
  }
};

// LOGOUT USER
export const logout = async (req, res) => {
  res.clearCookie("token");
  res.status(200).json({ success: true, message: "Logged out successfully" });
};

//GET FORGOT PASSWORD LINK
export const forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await userModel.findOne({ email });

    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: "User doesn't exist" });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(20).toString("hex");
    const resetTokenExpiresAt = Date.now() + 60 * 60 * 1000; // Expires in an hour

    user.resetPasswordToken = resetToken;
    user.resetPasswordExpiresAt = resetTokenExpiresAt;

    await user.save();

    // SEND PASSWORD RESET EMAIL

    await sendPasswordResetEmail(
      user.email,
      `${process.env.CLIENT_URL}/reset-password/${resetToken}`
    );
    res.status(201).json({
      success: true,
      message: "Password reset link sent to your email.",
    });
  } catch (error) {
    console.log("Error resetting password", error);
    res
      .status(500)
      .json({ success: false, message: "Error resetting password." });
  }
};

//RESET PASSWORD
export const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    const user = await userModel.findOne({
      resetPasswordToken: token,
      resetPasswordExpiresAt: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired reset token",
      });
    }

    // Update and save new password
    user.password = await bcrypt.hash(password, 12);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpiresAt = undefined;
    await user.save();

    await sendResetSuccessEmail(user.email);

    res.status(200).json({
      success: true,
      message: "Password reset successful",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Something went wrong",
      error: error.message,
    });
  }
};

// CHECK IF USER IS AUTHENTICATED
export const checkAuth = async (req, res) => {
  try {
    const user = await userModel.findById(req.userId).select("-password");
    if (!user) {
      return res
        .status(401)
        .json({ success: false, message: "User not found" });
    }

    res.status(201).json({
      success: true,
      user,
    });
  } catch (error) {
    console.log("Error in checking user authentication", error);
    res.status(500).json({ success: false, message: error.message });
  }
};
