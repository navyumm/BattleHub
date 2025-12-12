// src/app/api/challenge/submit/route.ts
import { NextRequest, NextResponse } from "next/server";
import { connect } from "@/dbConfig/dbConfig";
import Room from "@/models/roomModel";
import { getDataFromToken } from "@/helpers/getDataFromToken";

await connect();

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { roomId, score } = body;
    if (!roomId || typeof score !== "number") {
      return NextResponse.json({ success: false, message: "Missing roomId or score" }, { status: 400 });
    }

    const userId = await getDataFromToken(req);
    if (!userId) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

    const room = await Room.findOne({ roomId });
    if (!room) return NextResponse.json({ success: false, message: "Room not found" }, { status: 404 });

    // Optional: check time window
    if (room.timeStarted) {
      const end = new Date(room.timeStarted).getTime() + (room.timeLimitMinutes || 15) * 60_000;
      if (Date.now() > end) {
        // time is over — still allow or reject depending on policy
        // we'll still accept but mark as late (optional)
      }
    }

    // Upsert user's score in room.scores
    const idx = room.scores.findIndex((s: any) => String(s.userId) === String(userId));
    const usernameFromPlayers = room.players.find((p: any) => String(p.id) === String(userId))?.username || `user-${String(userId).slice(-4)}`;

    if (idx >= 0) {
      // update if better
      room.scores[idx].score = score;
      room.scores[idx].submittedAt = new Date();
      room.scores[idx].username = usernameFromPlayers;
    } else {
      room.scores.push({
        userId: String(userId),
        username: usernameFromPlayers,
        score,
        submittedAt: new Date(),
      });
    }

    // If all players have submitted (optional)
    const allSubmitted = room.players.length > 0 && room.scores.length >= room.players.length;
    if (allSubmitted) room.completed = true;

    await room.save();

    return NextResponse.json({ success: true, message: "Score submitted", room });
  } catch (err) {
    console.error("submit route error", err);
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}
