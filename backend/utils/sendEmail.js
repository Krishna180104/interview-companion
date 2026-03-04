const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

exports.sendOTP = async (email, otp) => {
  try {
    await transporter.sendMail({
      from: `"Interview Companion" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Verify your Email",
      html: `
        <h2>Email Verification</h2>
        <p>Your OTP code is:</p>
        <h1>${otp}</h1>
        <p>This OTP will expire in 10 minutes.</p>
      `,
    });

    console.log("OTP email sent");
  } catch (error) {
    console.error("Email send failed:", error);
  }
};