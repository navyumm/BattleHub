"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function ChallengeSelectPage() {
  const { id } = useParams();
  const router = useRouter();
  const [targets, setTargets] = useState<Record<number, string>>({});

  useEffect(() => {
    async function load() {
      const monthAbbr = new Date().toLocaleString("en", { month: "short" }).toLowerCase();
      const days = 31;
      const result: Record<number, string> = {};

      await Promise.all(
        Array.from({ length: days }).map(async (_, i) => {
          const d = i + 1;
          const url = `/${monthAbbr}-${d}.png`;
          try {
            const r = await fetch(url, { method: "HEAD" });
            if (r.ok) result[d] = url;
          } catch {}
        })
      );

      setTargets(result);
    }
    load();
  }, []);

  const select = async (day: number, img: string) => {
    await fetch("/api/challenge/start", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ roomId: id, day, targetImage: img }),
    });

    router.push(`/challenges/play/${id}`);
  };

  return (
    <div className="pt-28 text-white min-h-screen flex flex-col items-center">
      <h1 className="text-3xl font-bold mb-6">Select a Challenge</h1>

      <div className="grid grid-cols-4 gap-4">
        {Object.entries(targets).map(([day, img]) => (
          <div
            key={day}
            className="p-3 bg-black/40 rounded-xl border border-purple-600/20 hover:scale-105 transition cursor-pointer"
            onClick={() => select(Number(day), img)}
          >
            <img src={img} className="w-full h-24 object-contain" />
            <p className="text-center mt-2">Day {day}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
