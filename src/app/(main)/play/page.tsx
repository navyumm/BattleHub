"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import dayjs from "dayjs";

export default function PlayPage() {
  const router = useRouter();

  const [currentMonth, setCurrentMonth] = useState(dayjs());
  const [availableTargets, setAvailableTargets] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState(false);

  // Cache for already loaded months (useRef so it doesn't cause re-render)
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
    (day: number) => {
      if (availableTargets[day]) router.push(`/play/${day}`);
    },
    [router, availableTargets]
  );

  useEffect(() => {
    if (cacheRef.current[monthKey]) {
      setAvailableTargets(cacheRef.current[monthKey]);
      setLoading(false);
      return;
    }

    const loadMonthTargets = async () => {
      setLoading(true);
      const targets: Record<number, string> = {};

      // Use Promise.all for parallel fetches (faster)
      await Promise.all(
        Array.from({ length: daysInMonth }, async (_, i) => {
          const day = i + 1;
          const imgSrc = `/${monthAbbr}-${day}.png`;
          try {
            const res = await fetch(imgSrc, { method: "HEAD" });
            if (res.ok) targets[day] = imgSrc;
          } catch {
            /* ignore */
          }
        })
      );

      // Save to cache
      cacheRef.current[monthKey] = targets;
      setAvailableTargets(targets);
      setLoading(false);
    };

    loadMonthTargets();
  }, [monthKey, monthAbbr, daysInMonth]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-[#120019] to-[#000000] text-white flex flex-col items-center pt-28 pb-10 px-6">
      {/* ===== Header ===== */}
      <h1 className="text-3xl font-bold mb-6 text-center">
        Daily CSS Challenges
      </h1>

      {/* ===== Month Navigation ===== */}
      <div className="flex items-center justify-center gap-6 mb-10">
        <button
          onClick={() => setCurrentMonth(currentMonth.subtract(1, "month"))}
          className="text-2xl text-gray-400 hover:text-white transition border px-3 cursor-pointer hover:scale-105"
        >
          ‹
        </button>

        <h2 className="text-2xl font-semibold text-purple-400">
          {currentMonth.format("MMMM YYYY")}
        </h2>

        <button
          onClick={() => setCurrentMonth(currentMonth.add(1, "month"))}
          className="text-2xl text-gray-400 hover:text-white transition border px-3 cursor-pointer hover:scale-105"
        >
          ›
        </button>
      </div>

      {/* ===== Calendar Grid ===== */}
      <div className="grid grid-cols-7 gap-4 w-full max-w-5xl">
        {/* Weekday Headings */}
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
          <div
            key={d}
            className="text-center text-gray-500 font-semibold text-sm uppercase tracking-wider"
          >
            {d}
          </div>
        ))}

        {/* Empty slots before month start */}
        {Array.from({ length: firstDay }).map((_, i) => (
          <div key={`empty-${i}`} />
        ))}

        {/* Day Cells */}
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
              {/* ===== Date (top-right) ===== */}
              <span className="absolute top-2 right-2 text-xs text-gray-400 transition-opacity duration-300 group-hover:opacity-0">
                {day}
              </span>

              {/* ===== Image Area ===== */}
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

              {/* ===== Status Area ===== */}
              <div className="flex-[1] w-full flex items-center justify-center text-xs font-medium border-t border-gray-800 text-gray-400">
                {loading ? "Loading..." : hasTarget ? "Not Played" : ""}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
