// src/app/api/challenge/room/[id]/route.ts
import { NextResponse } from "next/server";
import { connect } from "@/dbConfig/dbConfig";
import Room from "@/models/roomModel";

await connect();

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const url = new URL(req.url);
    // Next's route handler in App Router passes params separately - but when using dynamic route file
    // sometimes you can extract id from req.url; we'll try both for safety:
    const match = req.url.match(/\/api\/challenge\/room\/([^/?]+)/);
    const roomId = (match && match[1]) || (params?.id) || url.pathname.split("/").pop();

    if (!roomId) return NextResponse.json({ success: false, message: "roomId missing" }, { status: 400 });

    const room = await Room.findOne({ roomId }).lean();
    if (!room) return NextResponse.json({ success: true, room: null }, { status: 200 });

    return NextResponse.json({ success: true, room }, { status: 200 });
  } catch (err) {
    console.error("room get error", err);
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}
