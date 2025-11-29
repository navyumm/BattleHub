import { connect } from "@/dbConfig/dbConfig";
import { NextRequest, NextResponse } from "next/server";
import User from "@/models/userModel";
import bcrypt from "bcryptjs";

connect();

export async function POST(request: NextRequest) {
  try {
    const { otp } = await request.json();

    if (!otp) {
      return NextResponse.json(
        { error: "OTP is required" },
        { status: 400 }
      );
    }

    // Find ALL users whose OTP is not expired
    const users = await User.find({
      verifyOTPExpiry: { $gt: Date.now() },
    });

    if (!users || users.length === 0) {
      return NextResponse.json(
        { error: "OTP expired or invalid" },
        { status: 400 }
      );
    }

    let matchedUser = null;

    // Compare OTP with each user's hashed OTP
    for (const u of users) {
      const match = await bcrypt.compare(otp.toString(), u.verifyOTP);
      if (match) {
        matchedUser = u;
        break;
      }
    }

    if (!matchedUser) {
      return NextResponse.json(
        { error: "Incorrect OTP" },
        { status: 400 }
      );
    }

    // Mark user as verified
    matchedUser.isVerified = true;
    matchedUser.verifyOTP = undefined;
    matchedUser.verifyOTPExpiry = undefined;
    await matchedUser.save();

    return NextResponse.json({
      success: true,
      message: "Email verified successfully",
    });

  } catch (error: any) {
    console.log("VERIFY ERROR:", error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
