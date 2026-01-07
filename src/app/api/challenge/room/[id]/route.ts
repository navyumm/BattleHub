import { NextRequest, NextResponse } from "next/server";
import { connect } from "@/dbConfig/dbConfig";
import Room from "@/models/roomModel";

await connect();

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    const url = new URL(request.url);

    // fallback safety (optional but fine)
    const match = request.url.match(/\/api\/challenge\/room\/([^/?]+)/);
    const roomId = id || (match && match[1]) || url.pathname.split("/").pop();

    if (!roomId) {
      return NextResponse.json(
        { success: false, message: "roomId missing" },
        { status: 400 }
      );
    }

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
