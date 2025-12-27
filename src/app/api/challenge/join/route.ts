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
      return NextResponse.json(
        { success: false, message: "roomId required" },
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

    // fetch username
    const user: any = await User.findById(userId)
      .select("username")
      .lean();

    const username = user?.username || `user-${String(userId).slice(-4)}`;

    let room: any = await Room.findOne({ roomId });

    if (!room) {
      // create room (host)
      room = await Room.create({
        roomId,
        ownerId: String(userId),
        players: [{ id: String(userId), username, joinedAt: new Date() }],
        started: false,
      });
    } else {
      // add player if not exists
      await Room.updateOne(
        { roomId, "players.id": { $ne: String(userId) } },
        {
          $push: {
            players: {
              id: String(userId),
              username,
              joinedAt: new Date(),
            },
          },
        }
      );

      room = await Room.findOne({ roomId }).lean();
    }

    const isHost = String(room.ownerId) === String(userId);

    return NextResponse.json(
      {
        success: true,
        room,
        isHost, // ✅ IMPORTANT
      },
      { status: 200 }
    );
  } catch (err) {
    console.error("join room error", err);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}
