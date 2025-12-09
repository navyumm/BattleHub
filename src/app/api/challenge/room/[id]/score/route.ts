// src/app/api/challenge/room/[id]/score/route.ts
import { NextResponse } from "next/server";
import { connect } from "@/dbConfig/dbConfig";
import Room from "@/models/roomModel";
import { getDataFromToken } from "@/helpers/getDataFromToken";

await connect();

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const body = await req.json();
    const score = body.score;
    if (score === undefined) return NextResponse.json({ success: false, message: "score required" }, { status: 400 });

    const match = req.url.match(/\/api\/challenge\/room\/([^/?]+)\/score/);
    const roomId = (match && match[1]) || (params?.id);
    if (!roomId) return NextResponse.json({ success: false, message: "roomId missing" }, { status: 400 });

    const userId = await getDataFromToken(req as any);
    if (!userId) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

    const room = await Room.findOne({ roomId });
    if (!room) return NextResponse.json({ success: false, message: "Room not found" }, { status: 404 });

    // find player and set score
    const idx = room.players.findIndex((p: { id: any; }) => String(p.id) === String(userId));
    if (idx === -1) {
      // optionally add them
      room.players.push({ id: String(userId), username: `user-${String(userId).slice(-4)}`, joinedAt: new Date(), score });
    } else {
      room.players[idx].score = score;
    }
    await room.save();

    // Optionally update user's own DB scores here (your existing /api/score/save already does that).

    return NextResponse.json({ success: true, room }, { status: 200 });
  } catch (err) {
    console.error("room score error", err);
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}
