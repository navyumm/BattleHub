// src/app/api/leaderboard/route.ts
import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConfig";
import User from "@/models/userModel";

export async function GET(req: Request) {
  try {
    await dbConnect();
  } catch (error) {
    console.error("DB connect error:", error);
    return NextResponse.json({ success: false, error: "DB connection failed" }, { status: 500 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get("limit") || "10");

    const users = await User.find({})
      .sort({ score: -1, createdAt: 1 })
      .limit(limit)
      .select("username email score isVerified createdAt")
      .lean();

    const formattedUsers = users.map((u: any) => ({
      _id: String(u._id),
      username: u.username,
      email: u.email,
      score: u.score ?? 0,
      isVerified: !!u.isVerified,
      createdAt: u.createdAt?.toISOString() || null,
    }));

    return NextResponse.json({ success: true, data: formattedUsers }, { status: 200 });
  } catch (error) {
    console.error("Leaderboard API error:", error);
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
  }
}
