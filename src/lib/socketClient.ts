import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

export const getSocket = () => {
  if (!socket) {
    socket = io("http://localhost:3001", {
      transports: ["websocket"],
    });

    socket.on("connect", () => {
      console.log("🟢 Global socket connected:", socket?.id);
    });

    socket.on("disconnect", () => {
      console.log("🔴 Global socket disconnected");
    });
  }

  return socket;
};
