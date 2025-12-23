// src/app/api/challenge/start/route.ts
import { NextResponse } from "next/server";
import { connect } from "@/dbConfig/dbConfig";
import Room from "@/models/roomModel";

await connect();

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const roomId = (body.roomId || "").trim();
    const challenge = body.challenge || null; // e.g. { day: '2', image: '/mar-2.png', ... } or id

    if (!roomId) {
      return NextResponse.json({ success: false, message: "roomId required" }, { status: 400 });
    }

    const updated: any = await Room.findOneAndUpdate(
      { roomId },
      { $set: { started: true, challenge: challenge, startedAt: new Date() } },
      { new: true }
    ).lean();

    if (!updated) {
      return NextResponse.json({ success: false, message: "Room not found" }, { status: 404 });
    }

    // return the updated room (dedup players)
    const players = Array.isArray(updated.players)
      ? updated.players.filter((p: any, idx: number, arr: any[]) => arr.findIndex(x => x.id === p.id) === idx)
      : [];

    return NextResponse.json({ success: true, room: { ...updated, players } }, { status: 200 });
  } catch (err) {
    console.error("start room error:", err);
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}
