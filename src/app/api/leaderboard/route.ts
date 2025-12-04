import { NextResponse } from "next/server";
import { connect } from "@/dbConfig/dbConfig";
import User from "@/models/userModel";

export async function GET(req: Request) {
  try {
    await connect();
  } catch (error) {
    console.error("DB connect error:", error);
    return NextResponse.json({ success: false, error: "DB connection failed" }, { status: 500 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get("limit") || "10");

    const users = await User.find({})
      .select("username email scores isVerified createdAt")
      .lean();

    const formattedUsers = users
      .map((u: any) => {
        const totalScore = Array.isArray(u.scores)
          ? u.scores.reduce((sum: any, s: { score: any; }) => sum + (s.score || 0), 0)
          : 0;

        return {
          _id: String(u._id),
          username: u.username,
          email: u.email,
          score: totalScore,
          isVerified: !!u.isVerified,
          createdAt: u.createdAt?.toISOString() || null,
        };
      })
      .sort((a, b) => b.score - a.score) // highest first
      .slice(0, limit);

    return NextResponse.json({ success: true, data: formattedUsers }, { status: 200 });
  } catch (error) {
    console.error("Leaderboard API error:", error);
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
  }
}
