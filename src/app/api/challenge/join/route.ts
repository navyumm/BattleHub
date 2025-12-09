// src/app/api/challenge/join/route.ts
import { NextResponse } from "next/server";
import { getDataFromToken } from "@/helpers/getDataFromToken";
import roomStore from "@/lib/roomStore";
import { connect } from "@/dbConfig/dbConfig";
import User from "@/models/userModel";

connect(); // so we can lookup username from mongo (optional)

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const roomId = (body.roomId || "").trim();
    if (!roomId) return NextResponse.json({ success: false, message: "roomId required" }, { status: 400 });

    // get user id from token (your helper)
    const userId = await getDataFromToken(req as any);
    if (!userId) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

    // lookup username in mongo (optional)
    let username = `user-${String(userId).slice(-4)}`;
    try {
      const u = await User.findById(userId).select("username").lean();
      if (u && (u as any).username) username = (u as any).username;
    } catch (err) {
      console.warn("User lookup failed:", err);
    }

    const player = { id: String(userId), username, joinedAt: new Date().toISOString() };
    const room = roomStore.addPlayerToRoom(roomId, player, String(userId));

    return NextResponse.json({ success: true, room }, { status: 200 });
  } catch (err) {
    console.error("join error", err);
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}
