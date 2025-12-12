import { NextResponse } from "next/server";
import Room from "@/models/roomModel";
import { connect } from "@/dbConfig/dbConfig";

await connect();

export async function POST(req: Request) {
  try {
    const { roomId, day, month } = await req.json();

    if (!roomId || !day || !month) {
      return NextResponse.json(
        { success: false, message: "roomId, day & month required" },
        { status: 400 }
      );
    }

    const monthAbbr = month.toLowerCase(); // jan, feb, mar...

    // IMPORTANT → public folder image path
    const image = `/${monthAbbr}-${day}.png`;

    const challenge = {
      day,
      month: monthAbbr,
      image,
    };

    const updated = await Room.findOneAndUpdate(
      { roomId },
      {
        challengeId: day,
        challenge,
        started: true,
      },
      { new: true }
    );

    if (!updated) {
      return NextResponse.json(
        { success: false, message: "Room not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Challenge selected",
      challenge,
      room: updated,
    });
  } catch (err) {
    return NextResponse.json(
      { success: false, message: "Server error", error: err },
      { status: 500 }
    );
  }
}
