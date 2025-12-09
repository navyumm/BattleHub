// src/app/api/challenge/join/route.ts
import { NextResponse } from "next/server";
import { roomStore } from "@/lib/roomStore";
import { getDataFromToken } from "@/helpers/getDataFromToken";
import { connect } from "@/dbConfig/dbConfig";
import User from "@/models/userModel";

connect(); // ensure mongoose connection

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const roomId = (body.roomId || "").trim();
    if (!roomId) {
      return NextResponse.json({ success: false, message: "roomId required" }, { status: 400 });
    }

    const userId = await getDataFromToken(req as any);
    if (!userId) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    // fetch username from mongo (cast to any to avoid TS lean types)
    const user = (await User.findById(userId).select("username").lean()) as any;
    const username = user?.username || `user-${String(userId).slice(-4)}`;

    // initialize room if not exists
    roomStore.createIfNotExists(roomId, String(userId));

    // add the player
    const player = {
      id: String(userId),
      username,
      joinedAt: new Date().toISOString(),
    };

    const room = roomStore.addPlayer(roomId, player);

    return NextResponse.json({
      success: true,
      room,
    });
  } catch (err) {
    console.error("join room error:", err);
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}
