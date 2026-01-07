"use client";
import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import PlayPage from "@/app/(main)/play/page";
import toast from "react-hot-toast";

type Player = {
  id: string;
  username: string;
};

export default function RoomPage() {
  const { id } = useParams();
  const router = useRouter();

  const [players, setPlayers] = useState<Player[]>([]);
  const [isHost, setIsHost] = useState(false);
  const [loadingJoin, setLoadingJoin] = useState(false);

  const joinedRef = useRef(false);
  const prevPlayersRef = useRef<Player[]>([]);

  /* ================= JOIN ROOM ================= */
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
          setPlayers(data.room.players || []);
          setIsHost(data.isHost);
          prevPlayersRef.current = data.room.players || [];
        }
      })
      .finally(() => setLoadingJoin(false));
  }, [id]);

  /* ================= POLLING ================= */
  useEffect(() => {
    if (!id) return;

    const poll = async () => {
      const res = await fetch(`/api/challenge/room/${id}`);
      if (!res.ok) return;
      const data = await res.json();

      if (data.room) {
        // 🔔 TOAST ON NEW JOIN
        const prev = prevPlayersRef.current;
        const curr = data.room.players || [];

        if (curr.length > prev.length) {
          const joined = curr.find(
            (p: Player) => !prev.some((x) => x.id === p.id)
          );
          if (joined) {
            toast.success(`${joined.username} joined the room`);
          }
        }

        prevPlayersRef.current = curr;
        setPlayers(curr);

        if (data.room.started) {
          router.push(`/challenges/play/${id}`);
        }
      }
    };

    poll();
    const interval = setInterval(poll, 1200);
    return () => clearInterval(interval);
  }, [id, router]);

  const showPlayPage = isHost && players.length >= 2;

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-[#120019] to-black text-white pt-24">
      {/* ================= HEADER ================= */}
      <h1 className="text-3xl font-bold text-orange-400 text-center mb-8">
        Room ID: {id}
      </h1>

      {/* ================= MAIN LAYOUT ================= */}
      <div className="flex flex-col lg:flex-row gap-6 px-6">
        {/* LEFT */}
        <div className="flex-1 min-h-[70vh] bg-[#0e0015] rounded-xl border border-white/10">
          {showPlayPage ? (
            <PlayPage isRoomMode roomId={String(id)} />
          ) : (
            <div className="h-full flex items-center justify-center text-gray-400">
              Waiting for challenge to start…
            </div>
          )}
        </div>

        {/* RIGHT SIDEBAR */}
        <aside className="w-full lg:w-80">
          <div className="lg:sticky lg:top-28 bg-black/70 backdrop-blur-xl border border-purple-500/30 rounded-2xl shadow-2xl p-6">
            <h2 className="text-xl font-semibold text-purple-300 mb-4">
              Players Joined
            </h2>

            <div className="flex flex-col gap-3 mb-6">
              {players.map((p, index) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between px-4 py-3 bg-[#111] rounded-lg border border-purple-500/20"
                >
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                    <span>{p.username}</span>

                    {/* 👑 HOST VISIBLE TO ALL */}
                    {index === 0 && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-orange-500/20 text-orange-400 border border-orange-400/30">
                        👑 Host
                      </span>
                    )}
                  </div>

                  <span className="text-xs text-green-400">Online</span>
                </div>
              ))}
            </div>

            {loadingJoin && (
              <p className="text-gray-400 text-sm text-center">
                Joining room…
              </p>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
