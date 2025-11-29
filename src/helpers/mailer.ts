import nodemailer from "nodemailer";
import User from "@/models/userModel";
import bcryptjs from "bcryptjs";

interface SendEmailParams {
  email: string;
  emailType: "VERIFY" | "RESET";
  userId: string;
}

export const sendEmail = async ({
  email,
  emailType,
  userId,
}: SendEmailParams) => {
  try {
    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Hash OTP before storing
    const hashedOtp = await bcryptjs.hash(otp, 10);

    if (emailType === "VERIFY") {
      await User.findByIdAndUpdate(userId, {
        verifyOTP: hashedOtp,
        verifyOTPExpiry: Date.now() + 10 * 60 * 1000, // 10 minutes
      });
    } else if (emailType === "RESET") {
      await User.findByIdAndUpdate(userId, {
        resetOTP: hashedOtp,
        resetOTPExpiry: Date.now() + 10 * 60 * 1000,
      });
    }

    // Email Transporter
    const transport = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS,
      },
    });

    const title =
      emailType === "VERIFY"
        ? "Email Verification OTP"
        : "Password Reset OTP";

    const mailOptions = {
      from: `"Battle-Hub" <${process.env.GMAIL_USER}>`,
      to: email,
      subject: `Battle-Hub | ${title}`,
      html: `
        <div style="
          font-family: Arial, sans-serif;
          background-color: #0f0f0f;
          padding: 30px;
          border-radius: 10px;
          color: #ffffff;
          max-width: 520px;
          margin: auto;
          border: 1px solid #2a2a2a;
        ">
          <h2 style="text-align: center; margin-bottom: 10px; color: "#ff4757";">
            ⚔️ Battle-Hub
          </h2>

          <p style="font-size: 15px; line-height: 1.6;">
            Hi Gamer,<br/><br/>
            To ${
              emailType === "VERIFY"
                ? "verify your email for Battle-Hub"
                : "reset your Battle-Hub password"
            }, please use the OTP below.
          </p>

          <div style="
            background: #1a1a1a;
            padding: 18px 0;
            border-radius: 8px;
            text-align: center;
            margin: 25px 0;
            border: 1px solid #333;
          ">
            <span style="
              font-size: 34px;
              color: #ff4757;
              font-weight: bold;
              letter-spacing: 6px;
            ">
              ${otp}
            </span>
          </div>

          <p style="font-size: 14px; color: #bbbbbb;">
            This OTP is valid for <strong>10 minutes</strong>.
          </p>

          <p style="font-size: 14px; color: #888;">
            If this wasn't you, please ignore this email.
          </p>

          <hr style="border: 0; border-top: 1px solid #333; margin: 25px 0;" />

          <p style="text-align: center; font-size: 13px; color: #555;">
            © ${new Date().getFullYear()} Battle-Hub. All Rights Reserved.
          </p>
        </div>
      `,
    };

    const mailResponse = await transport.sendMail(mailOptions);
    return mailResponse;
  } catch (error: any) {
    console.error("Email send error:", error.message);
    throw new Error(error.message);
  }
};
