import Bootcamp from "../models/BootCampModel.js";
import cloudinary from "../configs/cloudinary.js";
import userModel from "../models/userModel.js";

// Create a bootcamp (Admins only)
export const createBootcamp = async (req, res) => {
  console.log("=== BOOTCAMP CREATION DEBUG ===");
  console.log("Request body:", req.body);
  console.log("Request file:", req.file);
  console.log("User from token:", req.user); // If verifyToken adds user to req
  try {
    const bootcampData = {
      title: req.body.title,
      description: req.body.description,
      startDate: req.body.startDate,
      endDate: req.body.endDate,
      createdBy: req.user._id,
    };

    // Add image URL if uploaded
    if (req.file) {
      bootcampData.coverImage = req.file.path;
      bootcampData.coverImagePublicId = req.file.filename;
    }

    const bootcamp = new Bootcamp(bootcampData);
    await bootcamp.save();

    res.status(201).json(bootcamp);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Update a bootcamp
export const updateBootcamp = async (req, res) => {
  try {
    const bootcamp = await Bootcamp.findById(req.params.id);
    if (!bootcamp) {
      return res.status(404).json({ message: "Bootcamp not found" });
    }

    // If new image is uploaded, delete old image from Cloudinary
    if (req.file && bootcamp.coverImagePublicId) {
      try {
        await cloudinary.uploader.destroy(bootcamp.coverImagePublicId);
      } catch (error) {
        console.log("Error deleting old image:", error);
      }
    }

    // Update bootcamp data
    const updateData = {
      title: req.body.title || bootcamp.title,
      description: req.body.description || bootcamp.description,
      startDate: req.body.startDate || bootcamp.startDate,
      endDate: req.body.endDate || bootcamp.endDate,
    };

    // Update image if new one is uploaded
    if (req.file) {
      updateData.coverImage = req.file.path;
      updateData.coverImagePublicId = req.file.filename;
    }

    const updatedBootcamp = await Bootcamp.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );

    res.json(updatedBootcamp);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Get all bootcamps (Public)
export const getBootcamps = async (req, res) => {
  try {
    const bootcamps = await Bootcamp.find().populate(
      "createdBy",
      "fullname email role"
    );
    res.status(200).json({ success: true, bootcamps });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get single bootcamp by ID
export const getSingleBootcamp = async (req, res) => {
  try {
    const bootcamp = await Bootcamp.findById(req.params.id);
    if (!bootcamp) {
      return res.status(404).json({ message: "Bootcamp not found" });
    }
    res.json(bootcamp);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete a bootcamp (Admins only)
export const deleteBootcamp = async (req, res) => {
  try {
    const bootcamp = await Bootcamp.findById(req.params.id);
    if (!bootcamp) {
      return res.status(404).json({ message: "Bootcamp not found" });
    }

    // Delete image from Cloudinary if exists
    if (bootcamp.coverImagePublicId) {
      try {
        await cloudinary.uploader.destroy(bootcamp.coverImagePublicId);
      } catch (error) {
        console.log("Error deleting image:", error);
      }
    }

    await Bootcamp.findByIdAndDelete(req.params.id);
    res.json({ message: "Bootcamp deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update the status of a bootcamp - isActive to "true" || "false"
export const updateBootcampStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    if (typeof isActive !== "boolean") {
      return res
        .status(400)
        .json({ message: "isActive must be true or false" });
    }

    const bootcamp = await Bootcamp.findByIdAndUpdate(
      id,
      { isActive },
      { new: true, runValidators: true }
    );

    if (!bootcamp) {
      return res.status(404).json({ message: "Bootcamp not found" });
    }

    // If bootcamp just ended, notify users
    if (isActive === false) {
      const registeredUsers = await userModel.find({ bootcamps: bootcamp._id });
      console.log(
        `DEV MODE - Bootcamp ${bootcamp.title} set to inactive. Found ${registeredUsers.length} participants`
      );
      for (const user of registeredUsers) {
        await sendBootcampEndedEmail(user.email, user.fullname, bootcamp.title);
      }
    }

    res.status(200).json({
      success: true,
      message: `Bootcamp status updated to ${isActive ? "Active" : "Inactive"}`,
      bootcamp,
    });
  } catch (error) {
    console.error("Error updating bootcamp status:", error);
    res.status(500).json({ message: "Server error" });
  }
};
