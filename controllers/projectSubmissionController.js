import ProjectSubmission from "../models/ProjectSubmission.js";
import Bootcamp from "../models/BootCampModel.js";
import cloudinary from "../configs/cloudinary.js";
import {
  sendOrgProjectSubmissionEmail,
  sendUserProjectConfirmationEmail,
} from "../mailtrap/emails.js";
import userModel from "../models/userModel.js";

// POST /api/bootcamps/:id/submit-project
export const submitProject = async (req, res) => {
  try {
    const userId = req.userId;
    const bootcampId = req.params.id;
    const { projectNumber } = req.body;

    const num = Number(projectNumber);
    if (!num || ![1, 2].includes(num)) {
      return res.status(400).json({ message: "projectNumber must be 1 or 2" });
    }
    if (!req.file) {
      return res.status(400).json({ message: "PDF file is required" });
    }

    // ✅ Ensure bootcamp exists
    const bootcamp = await Bootcamp.findById(bootcampId);
    if (!bootcamp)
      return res.status(404).json({ message: "Bootcamp not found" });

    // ✅ Get user details
    const user = await userModel.findById(userId).select("fullname email");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // ✅ Check if user already has submissions
    const existingSubs = await ProjectSubmission.find({
      user: userId,
      bootcamp: bootcampId,
    });

    const hasProject1 = existingSubs.some((s) => s.projectNumber === 1);
    const hasProject2 = existingSubs.some((s) => s.projectNumber === 2);
    const allApprovedOrPending =
      existingSubs.length === 2 &&
      existingSubs.every((s) => s.status !== "rejected");

    // 🚫 Block new submissions if both projects exist and not rejected
    if (allApprovedOrPending) {
      return res.status(400).json({
        message:
          "You have already submitted both projects. Wait for review results.",
      });
    }

    // ✅ Upload new file (replace if re-submitting rejected)
    const fileUrl = req.file.path;
    const filePublicId = req.file.filename;

    let submission = await ProjectSubmission.findOne({
      user: userId,
      bootcamp: bootcampId,
      projectNumber: num,
    });

    if (submission) {
      // Only allow update if it was rejected
      if (submission.status !== "rejected") {
        return res.status(400).json({
          message: "You cannot re-upload this project unless it was rejected.",
        });
      }

      // replace file
      try {
        await cloudinary.uploader.destroy(submission.filePublicId, {
          resource_type: "raw",
        });
      } catch (e) {
        console.log("Failed to delete old PDF:", e?.message || e);
      }

      submission.fileUrl = fileUrl;
      submission.filePublicId = filePublicId;
      submission.status = "pending"; // reset to pending on resubmission
      await submission.save();
    } else {
      // Create new
      submission = await ProjectSubmission.create({
        user: userId,
        bootcamp: bootcampId,
        projectNumber: num,
        name: user.fullname,
        email: user.email,
        fileUrl,
        filePublicId,
      });
    }

    // ✅ Check again if both projects exist now
    const submissions = await ProjectSubmission.find({
      user: userId,
      bootcamp: bootcampId,
    });
    const hasNow1 = submissions.some((s) => s.projectNumber === 1);
    const hasNow2 = submissions.some((s) => s.projectNumber === 2);

    if (hasNow1 && hasNow2) {
      const project1 = submissions.find((s) => s.projectNumber === 1);
      const project2 = submissions.find((s) => s.projectNumber === 2);

      await sendOrgProjectSubmissionEmail(
        process.env.COMPANY_EMAIL,
        user.fullname,
        user.email,
        bootcamp.title,
        [project1, project2]
      );

      await sendUserProjectConfirmationEmail(
        user.email,
        user.fullname,
        bootcamp.title
      );
    }

    return res.status(200).json({
      success: true,
      message: "Project submitted successfully",
      submission,
    });
  } catch (error) {
    console.error("Error submitting project:", error);
    return res.status(500).json({ message: error.message || "Server error" });
  }
};

// GET /api/bootcamps/:id/my-submissions
export const getMySubmissionsForBootcamp = async (req, res) => {
  try {
    const userId = req.userId;
    const bootcampId = req.params.id;

    const submissions = await ProjectSubmission.find({
      user: userId,
      bootcamp: bootcampId,
    }).sort({ projectNumber: 1 });

    return res.json({ submissions });
  } catch (error) {
    console.error("Error fetching submissions:", error);
    return res.status(500).json({ message: error.message || "Server error" });
  }
};
