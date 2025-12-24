import { NextRequest, NextResponse } from "next/server";
import { connect } from "@/dbConfig/dbConfig";
import Room from "@/models/roomModel";
import { getDataFromToken } from "@/helpers/getDataFromToken";
import { getIO } from "@/lib/socket";

await connect();

export async function POST(req: NextRequest) {
  try {
    const { roomId } = await req.json();
    const userId = await getDataFromToken(req);

    const room = await Room.findOne({ roomId });
    if (!room) {
      return NextResponse.json({ success: false }, { status: 404 });
    }

    if (String(room.ownerId) !== String(userId)) {
      return NextResponse.json({ success: false }, { status: 403 });
    }

    room.started = true;
    await room.save();

    const io = getIO();
    io.to(roomId).emit("challenge-started", {
      day: room.challenge.day,
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
