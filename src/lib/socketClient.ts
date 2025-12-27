import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

export const getSocket = async () => {
  if (!socket) {
    // First hit API to init server
    await fetch("/api/socket");

    socket = io({
      path: "/api/socket",
    });
  }
  return socket;
};
