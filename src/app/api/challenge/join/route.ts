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

    // fetch username from users collection
    // cast to any to avoid TypeScript issues when your model is plain JS
    const user: any = await User.findById(userId).select("username").lean();
    const username = user?.username || `user-${String(userId).slice(-4)}`;

    // Try to find a room
    let room = await Room.findOne({ roomId });

    if (!room) {
      // Room doesn't exist: create it + add player
      room = await Room.create({
        roomId,
        ownerId: String(userId),
        players: [{ id: String(userId), username, joinedAt: new Date() }],
        started: false,
      });
    } else {
      // Room exists: atomically add player only if not present.
      // This avoids race conditions that can insert same id twice.
      const addResult = await Room.updateOne(
        { roomId, "players.id": { $ne: String(userId) } }, // filter ensures player id not present
        {
          $push: {
            players: { id: String(userId), username, joinedAt: new Date() },
          },
        }
      );

      // If we updated (nModified may be 1) or not, fetch the fresh room state
      room = await Room.findOne({ roomId }).lean();
    }

    return NextResponse.json({ success: true, room }, { status: 200 });
  } catch (err) {
    console.error("join room error", err);
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}
