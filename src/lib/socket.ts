import { Server as IOServer } from "socket.io";

let io: IOServer | null = null;

export function initIO(server: any) {
  if (io) return io;

  io = new IOServer(server, {
    path: "/api/socket",
  });

  io.on("connection", (socket) => {
    console.log("🟢 Socket connected:", socket.id);

    socket.on("join-room", (roomId) => {
      socket.join(roomId);
      console.log("🟡 Joined room:", roomId);
    });
  });

  return io;
}

export function getIO() {
  if (!io) {
    throw new Error("Socket.io not initialized");
  }
  return io;
}
