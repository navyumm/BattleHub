import { NextResponse, NextRequest } from "next/server";
import { connect } from "@/dbConfig/dbConfig";
import Room from "@/models/roomModel";
import { getDataFromToken } from "@/helpers/getDataFromToken";
import { getIO } from "@/lib/socket";

await connect();

export async function POST(req: NextRequest) {
  try {
    const { roomId, day, image } = await req.json();

    if (!roomId || !day || !image) {
      return NextResponse.json(
        { success: false, message: "Missing required fields." },
        { status: 400 }
      );
    }

    const userId = await getDataFromToken(req);
    if (!userId) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const room = await Room.findOne({ roomId });
    if (!room) {
      return NextResponse.json(
        { success: false, message: "Room not found." },
        { status: 404 }
      );
    }

    if (String(room.ownerId) !== String(userId)) {
      return NextResponse.json(
        { success: false, message: "Only host can select challenges." },
        { status: 403 }
      );
    }

    // ✅ Save challenge
    room.challenge = { day, image };
    room.started = true;
    await room.save();

    // ✅ Emit ONLY if socket is ready
    try {
      const io = getIO();
      io.to(roomId).emit("challenge-started", { day });
    } catch {
      console.warn("Socket not initialized yet");
    }

    return NextResponse.json({
      success: true,
      message: "Challenge selected & started.",
      room,
    });
  } catch (error) {
    console.error("Select API error:", error);
    return NextResponse.json(
      { success: false, message: "Server error." },
      { status: 500 }
    );
  }
}
