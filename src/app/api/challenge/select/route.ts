import { NextResponse, NextRequest } from "next/server";
import { connect } from "@/dbConfig/dbConfig";
import Room from "@/models/roomModel";
import { getDataFromToken } from "@/helpers/getDataFromToken";

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

    // Get user (host)
    const userId = await getDataFromToken(req);

    const room = await Room.findOne({ roomId });
    if (!room) {
      return NextResponse.json(
        { success: false, message: "Room not found." },
        { status: 404 }
      );
    }

    // Check host
    if (String(room.ownerId) !== String(userId)) {
      return NextResponse.json(
        { success: false, message: "Only host can select challenges." },
        { status: 403 }
      );
    }

    // Save challenge
    room.challenge = { day, image };
    room.started = true;
    await room.save();

    return NextResponse.json({
      success: true,
      message: "Challenge selected successfully.",
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
