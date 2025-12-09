"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

type Player = { id: string; username: string };

export default function RoomPage() {
  const { id } = useParams();
  const router = useRouter();
  const [players, setPlayers] = useState<Player[]>([]);
  const [started, setStarted] = useState(false);

  // Join room
  useEffect(() => {
    if (!id) return;

    fetch("/api/challenge/join", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ roomId: id })
    });
  }, [id]);

  // Poll room state
  useEffect(() => {
    const interval = setInterval(async () => {
      const res = await fetch(`/api/challenge/room/${id}`);
      const data = await res.json();

      if (data.room) {
        setPlayers(data.room.players);
        setStarted(data.room.started);

        if (data.room.started) {
          router.push(`/challenges/play/${id}`);
        }
      }
    }, 1300);

    return () => clearInterval(interval);
  }, [id]);

  const startGame = async () => {
    const res = await fetch("/api/challenge/start", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ roomId: id })
    });

    const data = await res.json();
    if (data.success) {
      router.push(`/challenges/play/${id}`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-[#120019] to-[#000000] text-white flex flex-col items-center pt-28 px-6">

      <h1 className="text-3xl font-bold text-orange-400 mb-6 text-center">
        Room ID: {id}
      </h1>

      <div className="bg-black/60 backdrop-blur-xl border border-purple-500/30 rounded-2xl shadow-2xl p-8 w-full max-w-md">

        <h2 className="text-xl font-semibold text-purple-300 mb-4">
          Players Joined
        </h2>

        <div className="flex flex-col gap-3">
          {players.map(p => (
            <div
              key={p.id}
              className="px-4 py-3 bg-[#111] rounded-lg border border-purple-500/20 text-lg"
            >
              {p.username}
            </div>
          ))}
        </div>

        {players.length < 2 && (
          <p className="text-gray-400 text-sm mt-4 text-center">
            Waiting for more players...
          </p>
        )}

        {players.length >= 2 && (
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
