import mongoose from "mongoose";

const projectSubmissionSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "user", required: true },
    bootcamp: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Bootcamp",
      required: true,
    },
    projectNumber: { type: Number, enum: [1, 2], required: true }, // First or Second project
    name: { type: String, required: true }, // captured for name/template convenience
    email: { type: String, required: true }, // captured for email/template convenience
    fileUrl: { type: String, required: true }, // Cloudinary secure_url/path
    filePublicId: { type: String, required: true }, // Cloudinary public_id to allow deletion
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },

    // keep track of admin review
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user", // must be an admin
    },
    reviewedAt: { type: Date },
    feedback: { type: String }, // org can leave notes
  },
  { timestamps: true }
);

// Prevent duplicate submissions per user/bootcamp/project
projectSubmissionSchema.index(
  { user: 1, bootcamp: 1, projectNumber: 1 },
  { unique: true }
);

const ProjectSubmission = mongoose.model(
  "ProjectSubmission",
  projectSubmissionSchema
);
export default ProjectSubmission;
