import { mailTrapClient, sender } from "./mailtrap.config.js";
import {
  PASSWORD_RESET_REQUEST_TEMPLATE,
  PASSWORD_RESET_SUCCESS_TEMPLATE,
  VERIFICATION_EMAIL_TEMPLATE,
} from "./emailTemplates.js";

// Helper: format dates
const formatDate = (date) =>
  new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

export const sendVerificationEmail = async (email, verificationToken) => {
  const recipient = [{ email }];

  // In development, skip sending and just log the token
  if (process.env.NODE_ENV === "development") {
    console.log(
      `DEV MODE - Verification token for ${email}: ${verificationToken}`
    );
    return;
  }

  try {
    const response = await mailTrapClient.send({
      from: sender,
      to: recipient,
      subject: "Verify your email",
      html: VERIFICATION_EMAIL_TEMPLATE.replace(
        "{verificationCode}",
        verificationToken
      ),
      category: "Email Verification",
    });

    console.log("Email sent successfully", response);
  } catch (error) {
    console.log(error);
    throw new Error(`Error while sending verification email. ${error}`);
  }
};

export const sendWelcomeEmail = async (email, fullname) => {
  const recipient = [{ email }];

  // In development, skip sending and just log the token
  if (process.env.NODE_ENV === "development") {
    console.log(
      `Welcome Email - Welcome email for ${email}: ${(email, fullname)}`
    );
    return;
  }

  try {
    const response = await mailTrapClient.send({
      from: sender,
      to: recipient,
      template_uuid: "69fb6142-3c74-4909-b521-cc2a1194d9f2",
      template_variables: {
        company_info_name: "NSKAI",
        name: fullname,
      },
    });

    console.log("Welcome Email sent successfully", response);
  } catch (error) {
    console.log(error);
    throw new Error(`Error while sending welcome email. ${error}`);
  }
};

export const sendPasswordResetEmail = async (email, resetURL) => {
  const recipient = [{ email }];

  try {
    const response = await mailTrapClient.send({
      from: sender,
      to: recipient,
      subject: "Reset your password",
      html: PASSWORD_RESET_REQUEST_TEMPLATE.replace("{resetURL}", resetURL),
      category: "Password Reset",
    });

    console.log("Welcome Email sent successfully", response);
  } catch (error) {
    console.log("Error sending reset token", error);
    throw new Error("Error sending password reset token");
  }
};

export const sendResetSuccessEmail = async (email) => {
  try {
    await mailTrapClient.send({
      from: sender,
      to: [{ email }],
      subject: "Password reset successfully",
      html: PASSWORD_RESET_SUCCESS_TEMPLATE,
      category: "Password Reset",
    });
  } catch (error) {
    console.error("Error sending reset success email:", error);
    throw new Error("Failed to send password reset success email");
  }
};

export const sendBootcampRegistrationEmail = async (
  email,
  fullname,
  bootcampTitle,
  startDate,
  endDate
) => {
  const recipient = [{ email }];

  const formattedStart = formatDate(startDate);
  const formattedEnd = endDate ? formatDate(endDate) : null;

  const dateText = formattedEnd
    ? `${formattedStart} – ${formattedEnd}`
    : `Starts: ${formattedStart}`;

  // In dev mode, just log it
  if (process.env.NODE_ENV === "development") {
    console.log(
      `DEV MODE - Bootcamp registration email for ${email}:`,
      `${bootcampTitle} (${dateText})`
    );
    return;
  }

  try {
    const response = await mailTrapClient.send({
      from: sender,
      to: recipient,
      subject: "Bootcamp Registration Confirmation",
      html: `
        <h2>Hi ${fullname},</h2>
        <p>You’ve successfully registered for the <strong>${bootcampTitle}</strong> bootcamp.</p>
        <p><strong>Dates:</strong> ${dateText}</p>
        <p>We’re excited to have you onboard 🚀</p>
        <br/>
        <p>Best regards,</p>
        <p>The NSKAI Team</p>
      `,
      category: "Bootcamp Registration",
    });

    console.log("Bootcamp registration email sent successfully", response);
  } catch (error) {
    console.error("Error sending bootcamp registration email:", error);
    throw new Error("Failed to send bootcamp registration email");
  }
};

export const sendOrgProjectSubmissionEmail = async (
  orgEmail,
  userName,
  userEmail,
  bootcampTitle,
  submissions // array of project submissions
) => {
  const recipient = [{ email: orgEmail }];

  if (process.env.NODE_ENV === "development") {
    console.log(
      `DEV MODE - Org project submission notification: ${userName} (${userEmail}) submitted for ${bootcampTitle}`
    );
    console.log(
      "Attached PDFs:",
      submissions.map((s) => s.fileUrl)
    );
    return;
  }

  try {
    const response = await mailTrapClient.send({
      from: sender,
      to: recipient,
      subject: `New Project Submission - ${bootcampTitle}`,
      html: `
        <h2>New Project Submission</h2>
        <p><strong>User:</strong> ${userName} (${userEmail})</p>
        <p><strong>Bootcamp:</strong> ${bootcampTitle}</p>
        <p>The user has successfully submitted both Project 1 and Project 2.</p>
        <br/>
        <p>PDFs are attached for review.</p>
      `,
      attachments: submissions.map((s) => ({
        filename: `Project${s.projectNumber}.pdf`,
        type: "application/pdf",
        url: s.fileUrl, // Cloudinary link
      })),
      category: "Project Submission - Org Notification",
    });

    console.log("Org project submission email sent successfully", response);
  } catch (error) {
    console.error("Error sending org project submission email:", error);
    throw new Error("Failed to send org project submission email");
  }
};

export const sendUserProjectConfirmationEmail = async (
  userEmail,
  userName,
  bootcampTitle
) => {
  const recipient = [{ email: userEmail }];

  if (process.env.NODE_ENV === "development") {
    console.log(
      `DEV MODE - User project confirmation email: ${userName} for ${bootcampTitle}`
    );
    return;
  }

  try {
    const response = await mailTrapClient.send({
      from: sender,
      to: recipient,
      subject: "Your Project Submission Was Received",
      html: `
        <h2>Hi ${userName},</h2>
        <p>We’ve received your submissions for <strong>${bootcampTitle}</strong>.</p>
        <p>Your projects are now under review ✅.</p>
        <p>Once reviewed, you’ll receive another email with the results and congratulations 🎉.</p>
        <br/>
        <p>Best regards,</p>
        <p>The NSKAI Team</p>
      `,
      category: "Project Submission - User Confirmation",
    });

    console.log("User project confirmation email sent successfully", response);
  } catch (error) {
    console.error("Error sending user project confirmation email:", error);
    throw new Error("Failed to send user project confirmation email");
  }
};

export const sendProjectApprovedEmail = async (
  email,
  fullname,
  bootcampTitle,
  projectNumber
) => {
  const recipient = [{ email }];

  if (process.env.NODE_ENV === "development") {
    console.log(
      `✅ DEV MODE - Project ${projectNumber} approved for ${fullname} (${email}) in ${bootcampTitle}`
    );
    return;
  }

  try {
    const response = await mailTrapClient.send({
      from: sender,
      to: recipient,
      subject: `Project ${projectNumber} Approved - ${bootcampTitle}`,
      html: `
        <h2>Hi ${fullname},</h2>
        <p>Congratulations 🎉 Your <strong>Project ${projectNumber}</strong> for the <strong>${bootcampTitle}</strong> has been <strong>approved</strong>.</p>
        <p>Keep up the great work! 🚀</p>
        <br/>
        <p>Best regards,</p>
        <p>The NSKAI Team</p>
      `,
      category: "Project Approved",
    });

    console.log("Project approved email sent successfully", response);
  } catch (error) {
    console.error("❌ Error sending project approved email:", error);
    throw new Error("Failed to send project approved email");
  }
};

export const sendProjectRejectedEmail = async (
  email,
  fullname,
  bootcampTitle,
  projectNumber,
  feedback
) => {
  const recipient = [{ email }];

  if (process.env.NODE_ENV === "development") {
    console.log(
      `❌ DEV MODE - Project ${projectNumber} rejected for ${fullname} (${email}) in ${bootcampTitle}. Feedback: ${feedback}`
    );
    return;
  }

  try {
    const response = await mailTrapClient.send({
      from: sender,
      to: recipient,
      subject: `Project ${projectNumber} Rejected - ${bootcampTitle}`,
      html: `
        <h2>Hi ${fullname},</h2>
        <p>Unfortunately, your <strong>Project ${projectNumber}</strong> for the <strong>${bootcampTitle}</strong> has been <strong>rejected</strong>.</p>
        <p><strong>Feedback:</strong> ${feedback}</p>
        <p>You may revise your project and resubmit for another review.</p>
        <br/>
        <p>Don’t give up — each step brings growth 💪</p>
        <p>The NSKAI Team</p>
      `,
      category: "Project Rejected",
    });

    console.log("Project rejected email sent successfully", response);
  } catch (error) {
    console.error("❌ Error sending project rejected email:", error);
    throw new Error("Failed to send project rejected email");
  }
};

export const sendAllProjectsApprovedEmail = async (
  email,
  fullname,
  bootcampTitle
) => {
  const recipient = [{ email }];

  if (process.env.NODE_ENV === "development") {
    console.log(
      `🎉 DEV MODE - All projects approved for ${fullname} (${email}) in ${bootcampTitle}`
    );
    return;
  }

  try {
    const response = await mailTrapClient.send({
      from: sender,
      to: recipient,
      subject: `All Projects Approved - ${bootcampTitle}`,
      html: `
        <h2>Congratulations ${fullname}! 🎉</h2>
        <p>We’re thrilled to let you know that <strong>both of your projects</strong> for the <strong>${bootcampTitle}</strong> have been <strong>approved</strong>.</p>
        <p>This is a big milestone — your dedication and hard work are paying off 🚀</p>
        <p>We’re excited to see where this journey takes you next.</p>
        <br/>
        <p>Cheers,</p>
        <p>The NSKAI Team</p>
      `,
      category: "All Projects Approved",
    });

    console.log("All projects approved email sent successfully", response);
  } catch (error) {
    console.error("❌ Error sending all projects approved email:", error);
    throw new Error("Failed to send all projects approved email");
  }
};

export const sendBootcampEndedEmail = async (
  email,
  fullname,
  bootcampTitle
) => {
  const recipient = [{ email }];

  if (process.env.NODE_ENV === "development") {
    console.log(
      `DEV MODE - Bootcamp ended email for ${email}:`,
      `${bootcampTitle} has ended`
    );
    return;
  }

  try {
    const response = await mailTrapClient.send({
      from: sender,
      to: recipient,
      subject: `Bootcamp Completed - ${bootcampTitle}`,
      html: `
        <h2>Hi ${fullname},</h2>
        <p>The <strong>${bootcampTitle}</strong> bootcamp has officially ended.</p>
        <p>You can now <a href="https://yourdomain.com/certificates">download your certificate</a> 🎓</p>
        <br/>
        <p>Congratulations on completing this journey 🚀</p>
        <p>Best regards,</p>
        <p>The NSKAI Team</p>
      `,
      category: "Bootcamp Ended",
    });

    console.log("Bootcamp ended email sent successfully", response);
  } catch (error) {
    console.error("Error sending bootcamp ended email:", error);
    throw new Error("Failed to send bootcamp ended email");
  }
};
