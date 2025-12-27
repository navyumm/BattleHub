"use client";
import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import PlayPage from "@/app/(main)/play/page";

type Player = {
  id: string;
  username: string;
  joinedAt?: string;
  score?: number | null;
};

export default function RoomPage() {
  const { id } = useParams();
  const router = useRouter();

  const [players, setPlayers] = useState<Player[]>([]);
  const [room, setRoom] = useState<any>(null);
  const [isHost, setIsHost] = useState(false);
  const [loadingJoin, setLoadingJoin] = useState(false);

  const joinedRef = useRef(false);

  /* ---------------- JOIN ROOM ---------------- */
  useEffect(() => {
    if (!id || joinedRef.current) return;
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
          setRoom(data.room);
          setPlayers(data.room.players || []);
          setIsHost(data.isHost); // ✅ FIXED LINE
        }
      })
      .catch(console.error)
      .finally(() => setLoadingJoin(false));
  }, [id]);

  /* ---------------- POLLING ---------------- */
  useEffect(() => {
    if (!id) return;

    const poll = async () => {
      try {
        const res = await fetch(`/api/challenge/room/${id}`);
        if (!res.ok) return;
        const data = await res.json();
        if (data.room) {
          setRoom(data.room);
          setPlayers(data.room.players || []);

          if (data.room.started) {
            router.push(`/challenges/play/${id}`);
          }
        }
      } catch (err) {
        console.error("Polling error:", err);
      }
    };

    poll();
    const interval = setInterval(poll, 1200);
    return () => clearInterval(interval);
  }, [id, router]);

  const showPlayPage = isHost && players.length >= 2;
  console.log({ isHost, players: players.length });

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-[#120019] to-black text-white flex flex-col items-center pt-28 px-6">
      <h1 className="text-3xl font-bold text-orange-400 mb-6">Room ID: {id}</h1>

      <div className="bg-black/60 backdrop-blur-xl border border-purple-500/30 rounded-2xl shadow-2xl p-8 w-full max-w-md">
        <h2 className="text-xl font-semibold text-purple-300 mb-4">
          Players Joined
        </h2>

        <div className="flex flex-col gap-3 mb-6">
          {players.map((p) => (
            <div
              key={p.id}
              className="px-4 py-3 bg-[#111] rounded-lg border border-purple-500/20"
            >
              {p.username}
            </div>
          ))}
        </div>

        {/* ---------------- CONDITIONAL UI ---------------- */}
        {players.length < 2 && (
          <p className="text-gray-400 text-center">Waiting for more players…</p>
        )}

        {players.length >= 2 && !isHost && (
          <p className="text-gray-300 text-center">
            Waiting for host to select the challenge…
          </p>
        )}

        {showPlayPage && <PlayPage isRoomMode roomId={String(id)} />}
      </div>
    </div>
  );
}
