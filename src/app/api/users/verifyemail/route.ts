import { connect } from "@/dbConfig/dbConfig";
import { NextRequest, NextResponse } from "next/server";
import User from "@/models/userModel";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

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

    // Find users with non-expired OTP
    const users = await User.find({
      verifyOTPExpiry: { $gt: Date.now() },
    });

    if (!users || users.length === 0) {
      return NextResponse.json(
        { error: "OTP expired or invalid" },
        { status: 400 }
      );
    }

    let matchedUser: any = null;

    // Match OTP
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

    matchedUser.isVerified = true;
    matchedUser.verifyOTP = undefined;
    matchedUser.verifyOTPExpiry = undefined;
    await matchedUser.save();

    const tokenData = {
      id: matchedUser._id,
      username: matchedUser.username,
      email: matchedUser.email,
    };

    const token = jwt.sign(tokenData, process.env.TOKEN_SECRET!, {
      expiresIn: "7d",
    });

    const response = NextResponse.json({
      success: true,
      message: "OTP verified, login successful",
    });

    response.cookies.set("token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60, // 7 days
    });

    return response;

  } catch (error: any) {
    console.log("VERIFY ERROR:", error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
