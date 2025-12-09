// src/app/challenges/room/[id]/page.tsx
"use client";
import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";

type Player = { id: string; username: string; joinedAt?: string; score?: number | null };

export default function RoomPage() {
  const { id } = useParams();
  const router = useRouter();
  const [players, setPlayers] = useState<Player[]>([]);
  const [started, setStarted] = useState(false);
  const [loadingJoin, setLoadingJoin] = useState(false);

  // guard so join POST runs only once (prevents StrictMode double-run)
  const joinedRef = useRef(false);

  // Join room on mount and use server response to update UI immediately
  useEffect(() => {
    if (!id) return;
    if (joinedRef.current) return;
    joinedRef.current = true;

    setLoadingJoin(true);
    fetch("/api/challenge/join", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ roomId: id }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (data?.success && data.room) {
          // use server returned players so we don't wait for first poll
          setPlayers(data.room.players || []);
          setStarted(!!data.room.meta?.started || !!data.room.started);
          if (data.room.meta?.started || data.room.started) {
            router.push(`/challenges/play/${id}`);
          }
        }
      })
      .catch((e) => console.error("join error", e))
      .finally(() => setLoadingJoin(false));
  }, [id, router]);

  // Poll room state regularly
  useEffect(() => {
    if (!id) return;

    const poll = async () => {
      try {
        const res = await fetch(`/api/challenge/room/${id}`);
        if (!res.ok) return;
        const data = await res.json();
        if (data.room) {
          setPlayers(data.room.players || []);
          setStarted(data.room.started || false);
          if (data.room.started) {
            router.push(`/challenges/play/${id}`);
          }
        }
      } catch (err) {
        console.error("Polling error:", err);
      }
    };

    poll(); // immediate poll (fixes not updating until refresh)
    const interval = setInterval(poll, 1200);
    return () => clearInterval(interval);
  }, [id, router]);

  const startGame = async () => {
    try {
      const res = await fetch("/api/challenge/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roomId: id }),
      });
      const data = await res.json();
      if (data?.success) {
        router.push(`/challenges/play/${id}`);
      } else {
        console.error("start failed", data);
      }
    } catch (err) {
      console.error("start error", err);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-[#120019] to-[#000000] text-white flex flex-col items-center pt-28 px-6">
      <h1 className="text-3xl font-bold text-orange-400 mb-6 text-center">Room ID: {id}</h1>

      <div className="bg-black/60 backdrop-blur-xl border border-purple-500/30 rounded-2xl shadow-2xl p-8 w-full max-w-md">
        <h2 className="text-xl font-semibold text-purple-300 mb-4">Players Joined</h2>

        <div className="flex flex-col gap-3 mb-4">
          {players.map((p) => (
            <div key={p.id} className="px-4 py-3 bg-[#111] rounded-lg border border-purple-500/20 text-lg">
              {p.username}
              {typeof p.score === "number" && <span className="ml-3 text-sm text-gray-300">Score: {p.score}%</span>}
            </div>
          ))}
        </div>

        {players.length < 2 ? (
          <p className="text-gray-400 text-sm mt-4 text-center">Waiting for more players...</p>
        ) : (
          <p className="text-gray-300 text-sm mt-2">Ready to start</p>
        )}

        <div className="mt-6">
          {players.length >= 2 ? (
            <button
              onClick={startGame}
              className="w-full py-3 bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl text-lg font-semibold hover:scale-105 transition-all"
            >
              Start Challenge
            </button>
          ) : (
            <button className="w-full py-3 bg-gray-600 rounded-xl text-lg font-semibold" disabled>
              Waiting for players...
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
