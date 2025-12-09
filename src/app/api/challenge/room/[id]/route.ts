// src/app/api/challenge/room/[id]/route.ts
import { NextResponse } from "next/server";
import roomStore from "@/lib/roomStore";

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const roomId = params.id;
    const room = roomStore.getRoom(roomId);
    if (!room) return NextResponse.json({ success: true, room: null });
    return NextResponse.json({ success: true, room });
  } catch (err) {
    console.error("room get error", err);
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}
