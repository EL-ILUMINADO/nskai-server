import { sendBootcampRegistrationEmail } from "../mailtrap/emails.js";
import Bootcamp from "../models/BootCampModel.js";
import Registration from "../models/bootcampRegistrationModel.js";
import userModel from "../models/UserModel.js";

export const registerForBootcamp = async (req, res) => {
  try {
    const bootcampId = req.params.id;
    const userId = req.userId; // coming from auth middleware

    // Check bootcamp exists
    const bootcamp = await Bootcamp.findById(bootcampId);
    if (!bootcamp) {
      return res.status(404).json({ message: "Bootcamp not found" });
    }

    // Check if already registered
    const existing = await Registration.findOne({
      user: userId,
      bootcamp: bootcampId,
    });
    if (existing) {
      return res
        .status(400)
        .json({ message: "You are already registered for this bootcamp" });
    }

    // Create registration
    const registration = new Registration({
      user: userId,
      bootcamp: bootcampId,
    });
    await registration.save();

    // Get user info
    const user = await userModel.findById(userId);

    // Send confirmation email
    await sendBootcampRegistrationEmail(
      user.email,
      user.fullname,
      bootcamp.title,
      bootcamp.startDate,
      bootcamp.endDate
    );

    res.status(201).json({
      success: true,
      message: "Registered successfully and email sent",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getMyRegistrations = async (req, res) => {
  try {
    const registrations = await Registration.find({ user: req.userId })
      .populate("bootcamp", "title startDate endDate coverImage description")
      .sort({ createdAt: -1 });

    res.json({ registrations });
  } catch (err) {
    console.error("Error fetching registrations:", err);
    res.status(500).json({ message: "Server error fetching registrations" });
  }
};
