"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { getUserScores } from "@/helpers/getUserScores";
import dayjs from "dayjs";

interface PlayPageProps {
  isRoomMode?: boolean;
  roomId?: string;
}

export default function PlayPage({
  isRoomMode = false,
  roomId,
}: PlayPageProps) {
  const router = useRouter();

  const [currentMonth, setCurrentMonth] = useState(dayjs());
  const [availableTargets, setAvailableTargets] = useState<
    Record<number, string>
  >({});
  const [loading, setLoading] = useState(false);
  const [userScores, setUserScores] = useState<Record<number, number>>({});

  const cacheRef = useRef<Record<string, Record<number, string>>>({});

  const monthKey = useMemo(
    () => currentMonth.format("YYYY-MM"),
    [currentMonth]
  );
  const monthAbbr = useMemo(
    () => currentMonth.format("MMM").toLowerCase(),
    [currentMonth]
  );
  const daysInMonth = currentMonth.daysInMonth();
  const firstDay = currentMonth.startOf("month").day();

  const handleDayClick = useCallback(
    async (day: number, image: string) => {
      if (!availableTargets[day]) return;

      // 🟣 ROOM MODE
      if (isRoomMode && roomId) {
        try {
          const res = await fetch("/api/challenge/select", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              roomId,
              day,
              image,
            }),
          });

          if (!res.ok) {
            console.error("Failed to select challenge");
            return;
          }

          router.push(`/challenges/play/${roomId}`);
        } catch (err) {
          console.error("Select challenge error:", err);
        }
        return;
      }

      // 🔵 SOLO MODE
      router.push(`/play/${day}`);
    },
    [router, availableTargets, isRoomMode, roomId]
  );

  /* ---------- LOAD TARGETS ---------- */
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

  /* ---------- LOAD SCORES ---------- */
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
            className="text-center text-gray-500 font-semibold text-sm"
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
              onClick={() => hasTarget && handleDayClick(day, imgSrc)}
              className={`relative group aspect-square flex flex-col rounded-xl border ${
                hasTarget
                  ? "cursor-pointer hover:scale-105 hover:border-purple-500"
                  : "opacity-40 cursor-not-allowed"
              }`}
            >
              <span className="absolute top-2 right-2 text-xs text-gray-400">
                {day}
              </span>

              <div className="flex items-center justify-center flex-[3]">
                {loading ? (
                  <div className="w-[60%] h-[60%] bg-gray-800 animate-pulse rounded-md" />
                ) : imgSrc ? (
                  <img
                    src={imgSrc}
                    className="w-[75%] h-[75%] object-contain"
                  />
                ) : (
                  <div className="w-[75%] h-[75%] border border-gray-700 rounded-md" />
                )}
              </div>

              <div className="flex-[1] flex items-center justify-center text-xs text-gray-400 border-t border-gray-800">
                {hasTarget
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
