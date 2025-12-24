"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type TargetsMap = Record<number, string>;

export default function ChallengeSelectPage() {
  const { id: roomId } = useParams<{ id: string }>();
  const router = useRouter();

  const [targets, setTargets] = useState<TargetsMap>({});
  const [loading, setLoading] = useState(true);

  // Load available challenge images
  useEffect(() => {
    async function loadTargets() {
      const monthAbbr = new Date()
        .toLocaleString("en", { month: "short" })
        .toLowerCase();

      const DAYS_IN_MONTH = 31;
      const foundTargets: TargetsMap = {};

      await Promise.all(
        Array.from({ length: DAYS_IN_MONTH }, (_, i) => {
          const day = i + 1;
          const imageUrl = `/${monthAbbr}-${day}.png`;

          return fetch(imageUrl, { method: "HEAD" })
            .then((res) => {
              if (res.ok) foundTargets[day] = imageUrl;
            })
            .catch(() => null);
        })
      );

      setTargets(foundTargets);
      setLoading(false);
    }

    loadTargets();
  }, []);

  // Select challenge (host only)
  const handleSelect = async (day: number, image: string) => {
    try {
      await fetch("/api/challenge/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          roomId,
          day,
          targetImage: image,
        }),
      });

      router.push(`/challenges/play/${roomId}`);
    } catch (err) {
      console.error("Failed to start challenge:", err);
    }
  };

  return (
    <div className="min-h-screen pt-28 px-6 text-white flex flex-col items-center">
      <h1 className="mb-6 text-3xl font-bold">Select a Challenge</h1>

      {loading ? (
        <p className="text-gray-400">Loading challenges…</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-4xl w-full">
          {Object.entries(targets).map(([day, image]) => (
            <div
              key={day}
              onClick={() => handleSelect(Number(day), image)}
              className="
                cursor-pointer rounded-xl p-3
                bg-black/40 border border-purple-600/20
                transition-transform hover:scale-105
              "
            >
              <img
                src={image}
                alt={`Day ${day}`}
                className="h-24 w-full object-contain"
              />
              <p className="mt-2 text-center font-medium">Day {day}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
