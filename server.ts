import { createServer } from "http";
import { Server } from "socket.io";

const httpServer = createServer();

const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  console.log("🟢 Connected:", socket.id);

  socket.on("join-room", ({ roomId }) => {
    socket.join(roomId);
    console.log("Joined room:", roomId);
  });

  socket.on("start-challenge", ({ roomId, day }) => {
    console.log("🔥 Challenge started:", roomId, day);
    io.to(roomId).emit("challenge-started", { day });
  });

  socket.on("disconnect", () => {
    console.log("🔴 Socket disconnected:", socket.id);
  });
});

httpServer.listen(3001, () => {
  console.log("🚀 Socket server running on 3001");
});
