// src/app/api/challenge/start/route.ts
import { NextResponse } from "next/server";
import { connect } from "@/dbConfig/dbConfig";
import Room from "@/models/roomModel";
import { getDataFromToken } from "@/helpers/getDataFromToken";

await connect();

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const roomId = (body.roomId || "").trim();
    if (!roomId) return NextResponse.json({ success: false, message: "roomId required" }, { status: 400 });

    const userId = await getDataFromToken(req as any);
    if (!userId) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

    // Only owner can start? Optional - skip check if you want anyone to start
    const room = await Room.findOne({ roomId });
    if (!room) return NextResponse.json({ success: false, message: "Room not found" }, { status: 404 });

    // optional: if (room.ownerId !== String(userId)) return NextResponse.json({ success: false, message: "Only owner can start" }, { status: 403 });

    room.started = true;
    await room.save();

    return NextResponse.json({ success: true, room }, { status: 200 });
  } catch (err) {
    console.error("start room error", err);
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}
