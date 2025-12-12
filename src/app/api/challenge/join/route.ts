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
      return NextResponse.json(
        { success: false, message: "roomId required" },
        { status: 400 }
      );
    }

    // Get logged user ID from token
    const userId = await getDataFromToken(req as any);
    if (!userId) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    // Fetch username from DB
    const user: any = await User.findById(userId)
      .select("username")
      .lean();

    const username =
      user?.username || `user-${String(userId).slice(-4)}`;

    // Find existing room
    let room = await Room.findOne({ roomId });

    if (!room) {
      // ROOM DOES NOT EXIST → Create new room
      room = await Room.create({
        roomId,
        ownerId: String(userId),
        players: [
          {
            id: String(userId),
            username,
            joinedAt: new Date(),
          },
        ],
        started: false,
        challenge: null,
      });
    } else {
      // ROOM EXISTS → Add player only if not already added
      await Room.updateOne(
        {
          roomId,
          "players.id": { $ne: String(userId) },
        },
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

      // Fetch updated room
      room = await Room.findOne({ roomId }).lean();
    }

    // RETURN room + logged userId
    return NextResponse.json(
      {
        success: true,
        room,
        userId: String(userId), // ⭐ IMPORTANT
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
