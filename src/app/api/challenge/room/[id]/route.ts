// src/app/api/challenge/room/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { connect } from "@/dbConfig/dbConfig";
import Room from "@/models/roomModel";

await connect();

export async function GET(req: NextRequest, { params }: { params?: { id?: string } } = {}) {
  try {
    // robust id extraction: prefer params, fallback to parsing the URL
    let id = params?.id;
    if (!id) {
      try {
        const u = new URL(req.url);
        const parts = u.pathname.split("/");
        id = parts[parts.length - 1] || undefined;
      } catch (e) {
        // ignore - will error below if id missing
      }
    }

    if (!id) {
      return NextResponse.json({ success: false, message: "roomId required" }, { status: 400 });
    }

    const room: any = await Room.findOne({ roomId: id }).lean();
    if (!room) {
      return NextResponse.json({ success: false, message: "Room not found" }, { status: 404 });
    }

    // ensure players array is present and unique by id (dedupe)
    const players = Array.isArray(room.players)
      ? room.players.filter((p: any, idx: number, arr: any[]) => arr.findIndex(x => x.id === p.id) === idx)
      : [];

    return NextResponse.json({
      success: true,
      room: {
        roomId: room.roomId,
        ownerId: room.ownerId,
        players,
        started: !!room.started,
        challenge: room.challenge || null,
      },
    }, { status: 200 });
  } catch (err) {
    console.error("room get error:", err);
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}
