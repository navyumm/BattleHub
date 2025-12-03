import { connect } from "@/dbConfig/dbConfig";
import User from "@/models/userModel";
import { NextRequest, NextResponse } from "next/server";
import bcryptjs from "bcryptjs";
import { sendEmail } from "@/helpers/mailer";

connect();

export async function POST(request: NextRequest) {
  try {
    const { username, email, password } = await request.json();

    // Basic validation
    if (!username || !email || !password) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { error: "User already exists" },
        { status: 400 }
      );
    }

    // Hash password
    const salt = await bcryptjs.genSalt(10);
    const hashedPassword = await bcryptjs.hash(password, salt);

    // Create new user
    const newUser = new User({
      username,
      email,
      password: hashedPassword,
      isVerified: false, // ensure verification needed
    });

    const savedUser = await newUser.save();

    // Send OTP for verification
    await sendEmail({
      email,
      emailType: "VERIFY",
      userId: savedUser._id,
    });

    return NextResponse.json({
      message: "Signup successful. OTP sent to email.",
      success: true,
    });
  } catch (error: any) {
    console.log("SIGNUP ERROR: ", error.message);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
