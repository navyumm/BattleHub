// src/app/challenges/room/[id]/page.tsx
"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

type Player = { id: string; username: string; joinedAt?: string; score?: number | null };

export default function RoomPage() {
  const { id } = useParams();
  const router = useRouter();
  const [players, setPlayers] = useState<Player[]>([]);
  const [started, setStarted] = useState(false);
  const [loadingJoin, setLoadingJoin] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Join room on mount and use server response to update UI immediately
  useEffect(() => {
    if (!id) return;
    let mounted = true;
    setLoadingJoin(true);
    fetch("/api/challenge/join", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ roomId: id }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (!mounted) return;
        if (data?.success && data.room) {
          const uniq = Array.isArray(data.room.players) ? data.room.players : [];
          const uniquePlayers = uniq.filter((p: any, idx: number, arr: any[]) => arr.findIndex(x => x.id === p.id) === idx);
          setPlayers(uniquePlayers);
          setStarted(Boolean(data.room.started));
          if (data.room.started) router.push(`/challenges/play/${id}`);
        } else if (data && !data.success) {
          setError(data.message || "Join failed");
        }
      })
      .catch((e) => {
        console.error("join error", e);
        setError("Failed to join room");
      })
      .finally(() => setLoadingJoin(false));

    return () => {
      mounted = false;
    };
  }, [id, router]);

  // Poll room state
  useEffect(() => {
    if (!id) return;

    const poll = async () => {
      try {
        const res = await fetch(`/api/challenge/room/${id}`);
        const data = await res.json();
        if (data?.room) {
          const uniq = Array.isArray(data.room.players) ? data.room.players : [];
          const uniquePlayers = uniq.filter((p: any, idx: number, arr: any[]) => arr.findIndex(x => x.id === p.id) === idx);
          setPlayers(uniquePlayers);
          const startedNow = !!data.room.started;
          setStarted(startedNow);
          if (startedNow) {
            router.push(`/challenges/play/${id}`);
          }
        } else if (data && !data.success) {
          // room deleted or not found, you can redirect
          setError(data.message || "Room not found");
        }
      } catch (err) {
        console.error("Polling error:", err);
      }
    };

    poll(); // immediate run
    const interval = setInterval(poll, 1200);
    return () => clearInterval(interval);
  }, [id, router]);

  const startGame = async () => {
    setError(null);
    try {
      // If you want the host to choose a challenge, open a select UI and pass challenge in body.
      // For now we'll just call start without challenge metadata.
      const res = await fetch("/api/challenge/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roomId: id }),
      });
      const data = await res.json();
      if (data?.success) {
        // navigate immediately (server updated room.started = true)
        router.push(`/challenges/play/${id}`);
      } else {
        console.error("start failed", data);
        setError(data?.message || "Failed to start challenge");
      }
    } catch (err) {
      console.error("start error", err);
      setError("Failed to start challenge");
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
              <div className="flex justify-between items-center">
                <div>{p.username}</div>
                {typeof p.score === "number" && <div className="text-sm text-gray-300">Score: {p.score}%</div>}
              </div>
            </div>
          ))}
        </div>

        {error && <div className="text-red-400 text-sm mb-3">{error}</div>}

        {players.length < 2 ? (
          <p className="text-gray-400 text-sm mt-4 text-center">Waiting for more players...</p>
        ) : (
          <p className="text-gray-300 text-sm mt-2">Ready to start</p>
        )}

        <div className="mt-6">
          {players.length >= 2 && !started ? (
            <button
              onClick={startGame}
              className="w-full mt-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl text-lg font-semibold hover:scale-105 transition-all"
            >
              Select & Start Challenge
            </button>
          ) : (
            <button className="w-full py-3 bg-gray-600 rounded-xl text-lg font-semibold" disabled>
              {started ? "Challenge started..." : "Waiting for players..."}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
