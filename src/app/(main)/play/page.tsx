"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { getUserScores } from "@/helpers/getUserScores";
import dayjs from "dayjs";

interface PlayPageProps {
  onSelectChallenge?: (day: number, image: string) => void; 
  day?: number
  isRoomMode?: boolean; 
  roomId?: string | string[]; 
}

export default function PlayPage({ onSelectChallenge, isRoomMode, roomId, day }: PlayPageProps) {
  const router = useRouter();

  const [currentMonth, setCurrentMonth] = useState(dayjs());
  const [availableTargets, setAvailableTargets] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState(false);
  const [userScores, setUserScores] = useState<Record<number, number>>({});

  const cacheRef = useRef<Record<string, Record<number, string>>>({});

  const monthKey = useMemo(() => currentMonth.format("YYYY-MM"), [currentMonth]);
  const monthAbbr = useMemo(() => currentMonth.format("MMM").toLowerCase(), [currentMonth]);
  const daysInMonth = currentMonth.daysInMonth();
  const firstDay = currentMonth.startOf("month").day();

  // -----------------------------
  // MAIN CLICK HANDLER
  // -----------------------------
const handleDayClick = useCallback(
  (day: number) => {
    const img = availableTargets[day];
    if (!img) return;

    // ROOM MODE (host click)
    if (isRoomMode && onSelectChallenge) {
      onSelectChallenge(day, img);
      return;
    }

    if (isRoomMode && roomId) {
      router.push(`/play/${day}?roomId=${roomId}`);
      return;
    }

    router.push(`/play/${day}`);
  },
  [availableTargets, isRoomMode, onSelectChallenge, roomId, router]
);


  // -----------------------------
  // Load images for month
  // -----------------------------
  useEffect(() => {
    if (cacheRef.current[monthKey]) {
      setAvailableTargets(cacheRef.current[monthKey]);
      setLoading(false);
      return;
    }

    const loadMonthTargets = async () => {
      setLoading(true);
      const targets: Record<number, string> = {};

      await Promise.all(
        Array.from({ length: daysInMonth }, async (_, i) => {
          const day = i + 1;
          const imgSrc = `/${monthAbbr}-${day}.png`;

          try {
            const res = await fetch(imgSrc, { method: "HEAD" });
            if (res.ok) targets[day] = imgSrc;
          } catch {}
        })
      );

      cacheRef.current[monthKey] = targets;
      setAvailableTargets(targets);
      setLoading(false);
    };

    loadMonthTargets();
  }, [monthKey, monthAbbr, daysInMonth]);

  // -----------------------------
  // Load scores
  // -----------------------------
  useEffect(() => {
    const loadScores = async () => {
      const dbScores = await getUserScores();
      setUserScores(dbScores);
    };
    loadScores();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-[#120019] to-[#000000] text-white flex flex-col items-center pt-28 pb-10 px-6">

      <h1 className="text-3xl font-bold mb-6 text-center">
        Daily CSS Challenges
      </h1>

      <div className="grid grid-cols-7 gap-4 w-full max-w-5xl">

        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
          <div
            key={d}
            className="text-center text-gray-500 font-semibold text-sm uppercase tracking-wider"
          >
            {d}
          </div>
        ))}

        {Array.from({ length: firstDay }).map((_, i) => (
          <div key={`empty-${i}`} />
        ))}

        {Array.from({ length: daysInMonth }, (_, i) => {
          const day = i + 1;
          const imgSrc = availableTargets[day];
          const hasTarget = Boolean(imgSrc);

          return (
            <div
              key={day}
              onClick={() => hasTarget && handleDayClick(day)}
              className={`relative group aspect-square flex flex-col rounded-xl border border-gray-800 bg-[#111] overflow-hidden transition-transform duration-300 ${
                hasTarget
                  ? "cursor-pointer hover:scale-105 hover:border-purple-500"
                  : "opacity-40 cursor-not-allowed"
              }`}
            >
              <span className="absolute top-2 right-2 text-xs text-gray-400 transition-opacity duration-300 group-hover:opacity-0">
                {day}
              </span>

              <div className="flex items-center justify-center flex-[3]">
                {loading ? (
                  <div className="w-[60%] h-[60%] bg-gray-800 animate-pulse rounded-md" />
                ) : imgSrc ? (
                  <img
                    src={imgSrc}
                    alt={`Target ${day}`}
                    className="w-[75%] h-[75%] object-contain transition-transform duration-300 group-hover:scale-110"
                  />
                ) : (
                  <div className="w-[75%] h-[75%] border border-gray-700 rounded-md" />
                )}
              </div>

              <div className="flex-[1] w-full flex items-center justify-center text-xs font-medium border-t border-gray-800 text-gray-400">
                {loading
                  ? "Loading..."
                  : hasTarget
                  ? userScores[day] !== undefined
                    ? `Score: ${userScores[day]}%`
                    : "Not Played"
                  : ""}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
