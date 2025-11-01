import mongoose from "mongoose";

const bootcampSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    required: true,
  },
  startDate: {
    type: Date,
    required: true,
  },
  endDate: {
    type: Date,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  coverImage: {
    type: String, // Cloudinary URL
    default: null,
  },
  coverImagePublicId: {
    type: String, // Cloudinary public_id for deletion
    default: null,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
    required: true,
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Update the updatedAt field before saving
bootcampSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

const Bootcamp = mongoose.model("Bootcamp", bootcampSchema);

export default Bootcamp;
