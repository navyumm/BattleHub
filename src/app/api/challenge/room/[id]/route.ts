import { NextResponse } from "next/server";
import { connect } from "@/dbConfig/dbConfig";
import Room from "@/models/roomModel";
import User from "@/models/userModel";
import { getDataFromToken } from "@/helpers/getDataFromToken";
import { io } from "../../../../../../socket-server"; // path adjust if needed

await connect();

export async function POST(req: Request) {
  try {
    const { roomId } = await req.json();
    if (!roomId) {
      return NextResponse.json({ success: false }, { status: 400 });
    }

    const userId = await getDataFromToken(req as any);
    if (!userId) {
      return NextResponse.json({ success: false }, { status: 401 });
    }

    const user = (await User.findById(userId)
      .select("username")
      .lean()) as any;

    const username = user?.username ?? "Player";

    let room = await Room.findOne({ roomId });

    if (!room) {
      room = await Room.create({
        roomId,
        players: [{ id: String(userId), username }],
        started: false,
      });
    } else {
      const exists = room.players.some(
        (p: any) => p.id === String(userId)
      );
      if (!exists) {
        room.players.push({ id: String(userId), username });
        await room.save();
      }
    }

    // 🔥 SOCKET EVENT
    io.to(roomId).emit("room:update", {
      players: room.players,
      started: room.started,
    });

    return NextResponse.json({ success: true, room });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
