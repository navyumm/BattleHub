// src/app/api/challenge/room/[id]/route.ts
import { NextResponse } from "next/server";
import { roomStore } from "@/lib/roomStore";

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const roomId = params.id;
    if (!roomId) {
      return NextResponse.json({ success: false, message: "room id required" }, { status: 400 });
    }

    const room = roomStore.getRoom(roomId);
    if (!room) {
      return NextResponse.json({ success: false, message: "Room not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, room });
  } catch (err) {
    console.error("room get error:", err);
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}
