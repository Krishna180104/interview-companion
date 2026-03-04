const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  family: 4, // ⭐ force IPv4
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: {
    rejectUnauthorized: false,
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
        <p>This OTP expires in 10 minutes.</p>
      `,
    });

    console.log("OTP email sent");
  } catch (error) {
    console.error("Email send failed:", error);
  }
};