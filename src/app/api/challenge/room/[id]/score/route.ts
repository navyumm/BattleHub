// src/app/api/challenge/room/[id]/score/route.ts
import { NextRequest, NextResponse } from "next/server";
import { connect } from "@/dbConfig/dbConfig";
import Room from "@/models/roomModel";
import { getDataFromToken } from "@/helpers/getDataFromToken";

await connect();

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const roomId = params?.id;
    if (!roomId) return NextResponse.json({ success: false, message: "roomId required" }, { status: 400 });

    const userId = await getDataFromToken(request as any);
    if (!userId) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const score = Number(body.score);
    if (isNaN(score)) return NextResponse.json({ success: false, message: "Invalid score" }, { status: 400 });

    const room = await Room.findOne({ roomId });
    if (!room) return NextResponse.json({ success: false, message: "Room not found" }, { status: 404 });

    // find player in room and update score
    const idx = room.players.findIndex((p: { id: any; }) => String(p.id) === String(userId));
    if (idx === -1) {
      // If player not found, add them (but ideally join was called earlier)
      room.players.push({ id: String(userId), username: `user-${String(userId).slice(-4)}`, joinedAt: new Date(), score });
    } else {
      room.players[idx].score = score;
    }

    await room.save();

    return NextResponse.json({ success: true, room }, { status: 200 });
  } catch (err) {
    console.error("room score update error", err);
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}
