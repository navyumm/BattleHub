// src/app/api/challenge/start/route.ts
import { NextResponse } from "next/server";
import { roomStore } from "@/lib/roomStore";
import { getDataFromToken } from "@/helpers/getDataFromToken";
import { connect } from "@/dbConfig/dbConfig";

connect();

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

    // optionally check owner or just allow any player to start
    const room = roomStore.getRoom(roomId);
    if (!room) {
      return NextResponse.json({ success: false, message: "Room not found" }, { status: 404 });
    }

    // you can require owner:
    // if (room.ownerId !== String(userId)) return NextResponse.json({ success:false, message: "Only owner can start" }, { status:403 });

    // require at least 2 players
    if ((room.players?.length ?? 0) < 2) {
      return NextResponse.json({ success: false, message: "Not enough players" }, { status: 400 });
    }

    const updated = roomStore.setStarted(roomId, true);

    return NextResponse.json({ success: true, room: updated });
  } catch (err) {
    console.error("start room error:", err);
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}
