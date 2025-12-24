import { NextRequest } from "next/server";
import { initIO } from "@/lib/socket";

export async function GET(req: NextRequest) {
  // @ts-ignore
  const server = req.socket?.server;

  if (server) {
    initIO(server);
  }

  return new Response("Socket ready", { status: 200 });
}
