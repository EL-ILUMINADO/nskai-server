import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    fullname: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    lastLogin: { type: Date, default: Date.now },
    isAccountVerified: { type: Boolean, default: false },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    }, // 👈 Role-based field
    resetPasswordToken: String,
    resetPasswordExpiresAt: Date,
    verificationToken: String,
    verificationTokenExpiresAt: Date,
    isAdminVerified: { type: Boolean, default: false },
    bootcamps: [{ type: mongoose.Schema.Types.ObjectId, ref: "Bootcamp" }],
  },
  { timestamps: true }
);

const userModel = mongoose.models.user || mongoose.model("user", userSchema);

export default userModel;
