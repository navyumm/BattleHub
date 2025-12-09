// src/app/api/challenge/room/[id]/score/route.ts
import { NextResponse } from "next/server";
import { roomStore } from "@/lib/roomStore";
import { getDataFromToken } from "@/helpers/getDataFromToken";
import { connect } from "@/dbConfig/dbConfig";

connect();

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const roomId = params.id;
    const userId = await getDataFromToken(req as any);
    if (!userId) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const score = Number(body.score ?? NaN);
    if (isNaN(score)) return NextResponse.json({ success: false, message: "Invalid score" }, { status: 400 });

    const updatedRoom = roomStore.updatePlayerScore(roomId, String(userId), score);

    if (!updatedRoom) return NextResponse.json({ success: false, message: "Room not found" }, { status: 404 });

    return NextResponse.json({ success: true, room: updatedRoom });
  } catch (err) {
    console.error("update score error", err);
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}
