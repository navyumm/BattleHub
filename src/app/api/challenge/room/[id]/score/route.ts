// src/app/api/challenge/room/[id]/score/route.ts
import { NextResponse } from "next/server";
import { getDataFromToken } from "@/helpers/getDataFromToken";
import roomStore from "@/lib/roomStore";

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const roomId = params.id;
    const userId = await getDataFromToken(req as any);
    if (!userId) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const score = typeof body.score === "number" ? body.score : parseFloat(body.score);
    if (isNaN(score)) return NextResponse.json({ success: false, message: "score required" }, { status: 400 });

    const room = roomStore.addScoreToRoom(roomId, String(userId), score);
    if (!room) return NextResponse.json({ success: false, message: "Room not found" }, { status: 404 });

    return NextResponse.json({ success: true, room }, { status: 200 });
  } catch (err) {
    console.error("score update error", err);
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}
