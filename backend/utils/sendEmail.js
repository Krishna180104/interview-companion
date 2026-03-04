const { Resend } = require("resend");

const resend = new Resend(process.env.RESEND_API_KEY);

exports.sendOTP = async (email, otp) => {
  try {
    const response = await resend.emails.send({
      from: "Interview Companion <onboarding@resend.dev>",
      to: email,
      subject: "Verify your email",
      html: `
        <div style="font-family: Arial, sans-serif; text-align:center">
          <h2>Email Verification</h2>
          <p>Your OTP code is:</p>
          <h1 style="letter-spacing:4px">${otp}</h1>
          <p>This OTP expires in 10 minutes.</p>
        </div>
      `,
    });

    console.log("OTP email sent:", response);

  } catch (error) {
    console.error("Email send failed:", error);
  }
};