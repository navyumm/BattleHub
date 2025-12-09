// src/app/api/challenge/start/route.ts
import { NextResponse } from "next/server";
import { getDataFromToken } from "@/helpers/getDataFromToken";
import roomStore from "@/lib/roomStore";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const roomId = (body.roomId || "").trim();
    if (!roomId) return NextResponse.json({ success: false, message: "roomId required" }, { status: 400 });

    const userId = await getDataFromToken(req as any);
    if (!userId) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

    // pick a challenge — for prototype: pick day '1' or random
    // you can pick from available target images or logic you already have
    const challengeDay = String(Math.floor(Math.random() * 28) + 1); // 1..28

    const room = roomStore.startRoom(roomId, challengeDay);
    if (!room) return NextResponse.json({ success: false, message: "Room not found" }, { status: 404 });

    return NextResponse.json({ success: true, room }, { status: 200 });
  } catch (err) {
    console.error("start error", err);
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}
