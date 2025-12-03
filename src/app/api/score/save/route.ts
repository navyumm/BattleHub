import { NextRequest, NextResponse } from "next/server";
import { connect } from "@/dbConfig/dbConfig";
import User from "@/models/userModel";
import mongoose from "mongoose";
import { getDataFromToken } from "@/helpers/getDataFromToken";

connect();

export async function POST(request: NextRequest) {
  try {
    const userId = await getDataFromToken(request);
    console.log("userID", userId);

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const objectUserId = new mongoose.Types.ObjectId(userId);
    console.log("userID", objectUserId);

    const { day, score } = await request.json();

    if (!day || score === undefined) {
      return NextResponse.json({ error: "Invalid data" }, { status: 400 });
    }

    await User.findByIdAndUpdate(
      objectUserId,   // 👈 FIXED
      {
        $push: {
          scores: {
            day,
            score,
            date: new Date(),
          },
        },
      },
      { new: true }
    );

    return NextResponse.json({
      message: "Score saved successfully!",
    });
  } catch (error) {
    console.log(error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
