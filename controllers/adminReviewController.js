import {
  sendAllProjectsApprovedEmail,
  sendProjectApprovedEmail,
  sendProjectRejectedEmail,
} from "../mailtrap/emails.js";
import ProjectSubmission from "../models/ProjectSubmission.js";

export const reviewSubmission = async (req, res) => {
  try {
    if (req.role !== "admin") {
      return res.status(403).json({ message: "Access denied. Admins only." });
    }
    const { id } = req.params;
    const { status, feedback } = req.body;

    if (!["approved", "rejected"].includes(status)) {
      return res
        .status(400)
        .json({ message: "Status must be 'approved' or 'rejected'" });
    }

    const submission = await ProjectSubmission.findById(id).populate(
      "user bootcamp"
    );
    if (!submission) {
      return res.status(404).json({ message: "Submission not found" });
    }

    submission.status = status;
    if (status === "rejected")
      submission.feedback = feedback || "Your project was rejected.";
    await submission.save();

    // ✅ Send notification to user
    const user = submission.user;
    const bootcamp = submission.bootcamp;

    if (status === "approved") {
      await sendProjectApprovedEmail(
        user.email,
        user.fullname,
        bootcamp.title,
        submission.projectNumber
      );

      // 🎉 Check if both projects are approved
      const submissions = await ProjectSubmission.find({
        user: user._id,
        bootcamp: bootcamp._id,
      });
      const allApproved =
        submissions.length === 2 &&
        submissions.every((s) => s.status === "approved");

      if (allApproved) {
        await sendAllProjectsApprovedEmail(
          user.email,
          user.fullname,
          bootcamp.title
        );
      }
    } else if (status === "rejected") {
      await sendProjectRejectedEmail(
        user.email,
        user.fullname,
        bootcamp.title,
        submission.projectNumber,
        submission.feedback
      );
    }

    return res.status(200).json({
      success: true,
      message: `Submission ${status} successfully`,
      submission,
    });
  } catch (error) {
    console.error("Error reviewing submission:", error);
    res.status(500).json({ message: error.message || "Server error" });
  }
};
