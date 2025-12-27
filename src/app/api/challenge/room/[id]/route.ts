import { NextResponse } from "next/server";
import { connect } from "@/dbConfig/dbConfig";
import Room from "@/models/roomModel";

await connect();

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const url = new URL(req.url);

    const match = req.url.match(/\/api\/challenge\/room\/([^/?]+)/);
    const roomId =
      (match && match[1]) ||
      params?.id ||
      url.pathname.split("/").pop();

    if (!roomId) {
      return NextResponse.json(
        { success: false, message: "roomId missing" },
        { status: 400 }
      );
    }

    // 🔥 TELL TYPESCRIPT: this is a single room object
    const room = (await Room.findOne({ roomId }).lean()) as
      | {
          roomId: string;
          ownerId?: string;
          started?: boolean;
          meta?: any;
          players?: any[];
        }
      | null;

    if (!room) {
      return NextResponse.json(
        { success: true, room: null },
        { status: 200 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        room: {
          roomId: room.roomId,
          ownerId: room.ownerId,
          started: room.started,
          meta: room.meta ?? null,
          players: room.players ?? [],
        },
      },
      { status: 200 }
    );
  } catch (err) {
    console.error("room get error", err);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}
