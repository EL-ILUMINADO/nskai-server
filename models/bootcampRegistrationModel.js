import mongoose from "mongoose";

const registrationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    bootcamp: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Bootcamp",
      required: true,
    },
    registeredAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

const Registration = mongoose.model("Registration", registrationSchema);

export default Registration;
