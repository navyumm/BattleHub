import { NextRequest, NextResponse } from "next/server";
import { connect } from "@/dbConfig/dbConfig";
import Room from "@/models/roomModel";
import { getDataFromToken } from "@/helpers/getDataFromToken";

await connect();

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    const body = await request.json();
    const score = body.score;

    if (score === undefined) {
      return NextResponse.json(
        { success: false, message: "score required" },
        { status: 400 }
      );
    }

    const roomId = id;
    if (!roomId) {
      return NextResponse.json(
        { success: false, message: "roomId missing" },
        { status: 400 }
      );
    }

    const userId = await getDataFromToken(request as any);
    if (!userId) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const room = await Room.findOne({ roomId });
    if (!room) {
      return NextResponse.json(
        { success: false, message: "Room not found" },
        { status: 404 }
      );
    }

    const idx = room.players.findIndex(
      (p: { id: any }) => String(p.id) === String(userId)
    );

    if (idx === -1) {
      room.players.push({
        id: String(userId),
        username: `user-${String(userId).slice(-4)}`,
        joinedAt: new Date(),
        score,
      });
    } else {
      room.players[idx].score = score;
    }

    await room.save();

    return NextResponse.json(
      { success: true, room },
      { status: 200 }
    );
  } catch (err) {
    console.error("room score error", err);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}
