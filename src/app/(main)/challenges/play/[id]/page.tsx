"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import PlayPage from "@/app/(main)/play/[day]/page";

type Player = {
  id: string;
  username: string;
  score?: number;
};

export default function ChallengePlay() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [roomPlayers, setRoomPlayers] = useState<Player[]>([]);
  const [challengeDay, setChallengeDay] = useState<string | undefined>();
  const [submitted, setSubmitted] = useState(false);

  /* ---------------- POLL ROOM (NO SUBMIT LOGIC) ---------------- */
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
        console.error("room poll error", err);
      }
    }, 1000);

    return () => clearInterval(poll);
  }, [id]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-[#120019] to-black text-white pt-24 px-6">
      <h1 className="text-3xl font-bold text-orange-400 mb-2">
        Challenge Live — Room {id}
      </h1>

      <p className="text-gray-300 mb-6">
        Challenge Day:{" "}
        <span className="font-semibold text-white">
          {challengeDay ?? "Loading…"}
        </span>
      </p>

      {/* ================= PLAY AREA ================= */}
      {!submitted && (
        <PlayPage
          roomId={String(id)}
          onSubmitted={() => setSubmitted(true)} // ✅ ONLY SOURCE OF TRUTH
        />
      )}

      {/* ================= PLAYERS & SCORES ================= */}
      <div className="mt-10 max-w-3xl mx-auto bg-black/60 border border-purple-500/30 rounded-xl p-6">
        <h2 className="text-xl font-semibold text-purple-300 mb-4">
          Players
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {roomPlayers.map((p) => (
            <div
              key={p.id}
              className="p-4 bg-[#111] rounded-lg border border-purple-500/20"
            >
              <div className="font-semibold text-white">
                {p.username}
              </div>
              <div className="text-sm text-gray-300 mt-1">
                Score:{" "}
                {typeof p.score === "number"
                  ? `${p.score}%`
                  : "Not submitted"}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ================= AFTER SUBMIT ================= */}
      {submitted && (
        <div className="mt-10 flex flex-col items-center gap-4">
          <p className="text-lg text-green-400 font-semibold">
            🎉 Challenge submitted successfully!
          </p>

          <div className="flex gap-4">
            <button
              onClick={() => router.push("/challenges")}
              className="px-6 py-3 bg-purple-600 hover:bg-purple-700 rounded-xl font-semibold"
            >
              Want to play more
            </button>

            <button
              onClick={() => router.push("/play")}
              className="px-6 py-3 bg-gray-700 hover:bg-gray-800 rounded-xl font-semibold"
            >
              Go to Home
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
