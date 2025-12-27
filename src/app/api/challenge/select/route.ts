import { NextResponse } from "next/server";
import { connect } from "@/dbConfig/dbConfig";
import Room from "@/models/roomModel";
import { getDataFromToken } from "@/helpers/getDataFromToken";

await connect();

export async function POST(req: Request) {
  try {
    const { roomId, day, image } = await req.json();

    if (!roomId || !day || !image) {
      return NextResponse.json(
        { success: false, message: "Missing fields" },
        { status: 400 }
      );
    }

    const userId = await getDataFromToken(req as any);
    if (!userId) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const room: any = await Room.findOne({ roomId });
    if (!room) {
      return NextResponse.json(
        { success: false, message: "Room not found" },
        { status: 404 }
      );
    }

    // 🔒 only host
    if (String(room.ownerId) !== String(userId)) {
      return NextResponse.json(
        { success: false, message: "Only host can select challenge" },
        { status: 403 }
      );
    }

    // ✅ THIS WAS MISSING / WRONG
    room.started = true;
    room.meta = {
      challengeDay: day,
      image,
    };

    await room.save();

    return NextResponse.json(
      { success: true, room },
      { status: 200 }
    );
  } catch (err) {
    console.error("challenge select error", err);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}
