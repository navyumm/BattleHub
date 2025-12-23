import { Server } from "socket.io";
import http from "http";

const server = http.createServer();

const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

/**
 * In-memory room store
 */
type Player = {
  id: string;
  username: string;
};

type Room = {
  roomId: string;
  players: Player[];
  started: boolean;
};

const rooms = new Map<string, Room>();

io.on("connection", (socket) => {
  console.log("🟢 socket connected", socket.id);

  socket.on("join-room", ({ roomId, player }) => {
    socket.join(roomId);

    let room = rooms.get(roomId);
    if (!room) {
      room = { roomId, players: [], started: false };
      rooms.set(roomId, room);
    }

    const exists = room.players.some((p) => p.id === player.id);
    if (!exists) {
      room.players.push(player);
    }

    io.to(roomId).emit("room-update", room);
  });

  socket.on("start-room", ({ roomId }) => {
    const room = rooms.get(roomId);
    if (!room) return;

    room.started = true;
    io.to(roomId).emit("room-started", room);
  });

  socket.on("disconnect", () => {
    console.log("🔴 socket disconnected", socket.id);
  });
});

server.listen(4000, () => {
  console.log("🚀 Socket server running on http://localhost:4000");
});
