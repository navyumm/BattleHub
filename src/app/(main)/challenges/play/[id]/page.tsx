// src/app/challenges/play/[id]/page.tsx
"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

type Player = { id: string; username: string; score?: number };

export default function ChallengePlay() {
  const { id } = useParams();
  const [roomPlayers, setRoomPlayers] = useState<Player[]>([]);
  const [challengeDay, setChallengeDay] = useState<string | undefined>(undefined);
  const [submitting, setSubmitting] = useState(false);

  // Poll room state to reflect players and scores
  useEffect(() => {
    if (!id) return;
    const poll = setInterval(async () => {
      try {
        const res = await fetch(`/api/challenge/room/${id}`);
        const data = await res.json();
        if (data?.room) {
          setRoomPlayers(data.room.players || []);
          setChallengeDay(data.room.meta?.challengeDay);
        }
      } catch (err) {
        console.error("play poll error", err);
      }
    }, 1000);

    return () => clearInterval(poll);
  }, [id]);

  // helper to simulate compute similarity and submit
  const submitScore = async (score: number) => {
    if (!id) return;
    try {
      setSubmitting(true);
      // 1) Save to DB (your existing endpoint)
      await fetch("/api/score/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ day: challengeDay || "1", score }),
      });

      // 2) Update in-memory room so other player sees updated score
      await fetch(`/api/challenge/room/${id}/score`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ score }),
      });
    } catch (err) {
      console.error("submit error", err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-[#120019] to-[#000000] text-white flex flex-col items-center pt-28 px-6">
      <h1 className="text-3xl font-bold text-orange-400 mb-4">Challenge Live — Room {id}</h1>

      <div className="bg-black/60 backdrop-blur-xl border border-purple-500/30 rounded-2xl shadow-2xl p-8 w-full max-w-3xl">
        <div className="mb-6 text-gray-300">
          <div>Challenge Day: <span className="text-white font-semibold">{challengeDay || "TBD"}</span></div>
          <div className="text-sm text-gray-400 mt-1">Both players will see the same challenge.</div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          {roomPlayers.map((p) => (
            <div key={p.id} className="p-4 bg-[#111] rounded-lg border border-purple-500/20">
              <div className="font-semibold text-white">{p.username}</div>
              <div className="text-sm text-gray-300">Score: {typeof p.score === "number" ? `${p.score}%` : "—"}</div>
            </div>
          ))}
        </div>

        <div className="flex gap-3 justify-center">
          {/* For now, provide quick score buttons to simulate matching */}
          <button
            onClick={() => submitScore(80)}
            className="px-6 py-3 bg-purple-600 rounded-xl font-semibold"
            disabled={submitting}
          >
            Submit 80%
          </button>
          <button
            onClick={() => submitScore(95)}
            className="px-6 py-3 bg-orange-600 rounded-xl font-semibold"
            disabled={submitting}
          >
            Submit 95%
          </button>
        </div>
      </div>
    </div>
  );
}
