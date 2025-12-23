"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { socket } from "@/lib/socket";
import axios from "axios";

type Player = {
  id: string;
  username: string;
};

export default function RoomPage() {
  const { id } = useParams();
  const router = useRouter();

  const [players, setPlayers] = useState<Player[]>([]);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    if (!id) return;

    socket.connect();

    // get logged-in user
    axios.get("/api/users/me").then((res) => {
      const user = res.data.user;

      socket.emit("join-room", {
        roomId: id,
        player: {
          id: user._id,
          username: user.username,
        },
      });
    });

    socket.on("room:update", (room) => {
      setPlayers(room.players || []);
      setStarted(room.started);

      if (room.started) {
        router.push(`/challenges/play/${id}`);
      }
    });

    return () => {
      socket.off("room:update");
      socket.disconnect();
    };
  }, [id, router]);

  const startGame = () => {
    socket.emit("start-room", { roomId: id });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-[#120019] to-[#000000] text-white flex flex-col items-center pt-28 px-6">
      <h1 className="text-3xl font-bold text-orange-400 mb-6">
        Room ID: {id}
      </h1>

      <div className="bg-black/60 backdrop-blur-xl border border-purple-500/30 rounded-2xl shadow-2xl p-8 w-full max-w-md">
        <h2 className="text-xl font-semibold text-purple-300 mb-4">
          Players Joined
        </h2>

        <div className="flex flex-col gap-3">
          {players.map((p) => (
            <div
              key={p.id}
              className="px-4 py-3 bg-[#111] rounded-lg border border-purple-500/20 text-lg"
            >
              {p.username}
            </div>
          ))}
        </div>

        {players.length < 2 ? (
          <p className="text-gray-400 text-sm mt-4 text-center">
            Waiting for more players...
          </p>
        ) : (
          <button
            onClick={startGame}
            className="w-full mt-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl text-lg font-semibold hover:scale-105 transition-all"
          >
            Start Challenge
          </button>
        )}
      </div>
    </div>
  );
}
