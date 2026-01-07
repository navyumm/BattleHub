"use client";
import { useEffect, useState, useMemo } from "react";
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
  const [challengeDay, setChallengeDay] = useState<string>();
  const [submitted, setSubmitted] = useState(false);
  const [autoSubmitted, setAutoSubmitted] = useState(false);

  /* ⏱ TIMER */
  const TOTAL_TIME = 15 * 60;
  const [timeLeft, setTimeLeft] = useState(TOTAL_TIME);

  /* ================= POLL ROOM ================= */
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

  /* ================= TIMER ================= */
  useEffect(() => {
    if (submitted || timeLeft <= 0) return;

    const t = setInterval(() => {
      setTimeLeft((p) => p - 1);
    }, 1000);

    return () => clearInterval(t);
  }, [timeLeft, submitted]);

  /* ================= AUTO SUBMIT ================= */
  useEffect(() => {
    if (timeLeft === 0 && !submitted) {
      setAutoSubmitted(true);
      setSubmitted(true);
    }
  }, [timeLeft, submitted]);

  /* ================= WINNER ================= */
  const winner = useMemo(() => {
    const scoredPlayers = roomPlayers.filter(
      (p) => typeof p.score === "number"
    );

    if (scoredPlayers.length === 0) return null;

    return scoredPlayers.reduce((max, p) =>
      (p.score ?? 0) > (max.score ?? 0) ? p : max
    );
  }, [roomPlayers]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-[#120019] to-black text-white pt-24 px-6">
      {/* ================= HEADER ================= */}
      <div className="flex flex-col lg:flex-row lg:justify-between mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-orange-400">
            Challenge Live — Room {id}
          </h1>
          <p className="text-gray-300">
            Challenge Day:{" "}
            <span className="font-semibold text-white">
              {challengeDay ?? "Loading…"}
            </span>
          </p>
        </div>

        {/* TIMER */}
        {!submitted && (
          <div className="bg-black/60 border border-purple-500/30 rounded-xl px-4 py-2">
            <p className="text-xs text-gray-400 text-center">Time Left</p>
            <p className="text-lg font-bold text-purple-300 text-center">
              {minutes}:{seconds.toString().padStart(2, "0")}
            </p>
          </div>
        )}
      </div>

      {/* ================= PLAY AREA ================= */}
      {!submitted ? (
        <PlayPage
          roomId={String(id)}
          onSubmitted={() => {
            setSubmitted(true);
            setAutoSubmitted(false); // ✅ manual submit
          }}
        />
      ) : (
        <div className=" flex items-center justify-center">
          <p className="text-lg font-semibold text-green-400">
            {autoSubmitted
              ? "⏱ Time’s up! Challenge auto-submitted."
              : "🎉 Challenge submitted successfully!"}
          </p>
        </div>
      )}

      {/* ================= PLAYERS & SCORES ================= */}
      <div className="mt-12 max-w-4xl mx-auto bg-black/60 border border-purple-500/30 rounded-2xl p-6">
        <h2 className="text-xl font-semibold text-purple-300 mb-6">
          Players & Scores
        </h2>

        <div className="flex flex-col gap-4">
          {roomPlayers.map((p, index) => {
            const isWinner = winner?.id === p.id;

            return (
              <div
                key={p.id}
                className={`flex justify-between items-center px-5 py-4 rounded-xl border
                  ${
                    isWinner
                      ? "bg-green-500/10 border-green-400"
                      : "bg-[#111] border-purple-500/20"
                  }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-400">
                    #{index + 1}
                  </span>

                  <span className="font-semibold">
                    {p.username}
                  </span>

                  {isWinner && (
                    <span className="ml-2 text-sm text-green-400 font-bold">
                      🏆 Winner
                    </span>
                  )}
                </div>

                <span
                  className={`font-semibold ${
                    typeof p.score === "number"
                      ? isWinner
                        ? "text-green-400"
                        : "text-white"
                      : "text-gray-400"
                  }`}
                >
                  {typeof p.score === "number"
                    ? `${p.score}%`
                    : "Not submitted"}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* ================= ACTIONS ================= */}
      {submitted && (
        <div className="mt-10 flex justify-center gap-4 pb-16">
          <button
            onClick={() => router.push("/challenges")}
            className="px-6 py-3 bg-purple-600 hover:bg-purple-700 rounded-xl font-semibold"
          >
            Play More
          </button>

          <button
            onClick={() => router.push("/play")}
            className="px-6 py-3 bg-gray-700 hover:bg-gray-800 rounded-xl font-semibold"
          >
            Go Home
          </button>
        </div>
      )}
    </div>
  );
}
