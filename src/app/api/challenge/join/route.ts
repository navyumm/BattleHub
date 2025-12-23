// src/app/api/challenge/join/route.ts
import { NextResponse } from "next/server";
import { connect } from "@/dbConfig/dbConfig";
import Room from "@/models/roomModel";
import User from "@/models/userModel";
import { getDataFromToken } from "@/helpers/getDataFromToken";

await connect();

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

    // fetch username (defensive typing)
    const user: any = await User.findById(String(userId)).select("username").lean();
    const username = user?.username ?? `user-${String(userId).slice(-4)}`;

    const joinedAt = new Date();

    // Atomic upsert + addToSet to avoid duplicates (race-safe)
    const update = {
      $setOnInsert: {
        roomId,
        ownerId: String(userId),
        started: false,
        createdAt: joinedAt,
      },
      $addToSet: {
        // players is an array — addToSet with an object will avoid exact duplicate objects.
        // To avoid duplicate by id only, you may store players as subdocuments with _id: false (already done),
        // and still $addToSet will prevent identical objects. We'll also de-duplicate on read.
        players: { id: String(userId), username, joinedAt },
      },
    };

    const room = await Room.findOneAndUpdate({ roomId }, update, { upsert: true, new: true }).lean();

    return NextResponse.json({ success: true, room }, { status: 200 });
  } catch (err) {
    console.error("join room error:", err);
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}
