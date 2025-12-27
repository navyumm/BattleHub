"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import dayjs from "dayjs";
import CodeEditor from "../Editor";
import ComparePreview from "../ComparePreview";
import { toast } from "react-hot-toast";
import html2canvas from "html2canvas";
import { compareImages } from "../utils/compareImages";
import { getColorPalette } from "../utils/extractColors";

/* ================= TYPES ================= */
interface RoomMeta {
  challengeDay: number | string;
  image: string;
}

interface PlayPageProps {
  roomId?: string;
  onSubmitted?: () => void;
}

export default function PlayPage({ roomId, onSubmitted }: PlayPageProps) {
  const params = useParams<{ day?: string }>();
  const dayParam = params?.day;

  /* ================= STATE ================= */
  const [targetImg, setTargetImg] = useState<string | null>(null);
  const [challengeDay, setChallengeDay] = useState<string | null>(null);
  const [matchScore, setMatchScore] = useState<number | null>(null);
  const [colors, setColors] = useState<string[]>([]);

  const [code, setCode] = useState<string>(`
<div></div>
<style>
body {
  background: #191919;
}
div {
  width: 100px;
  height: 100px;
  background: orange;
  border-radius: 50%;
  margin: 90px auto;
}
</style>
`);

  /* =====================================================
     LOAD CHALLENGE
     Priority: ROOM MODE → SOLO MODE
  ===================================================== */
  useEffect(() => {
    // 🟣 ROOM MODE
    if (roomId) {
      fetch(`/api/challenge/room/${roomId}`)
        .then((res) => res.json())
        .then((data) => {
          const meta: RoomMeta | undefined = data?.room?.meta;
          if (meta?.image && meta?.challengeDay !== undefined) {
            setTargetImg(meta.image);
            setChallengeDay(String(meta.challengeDay));
          }
        })
        .catch(() => {
          toast.error("Failed to load room challenge");
        });

      return;
    }

    // 🔵 SOLO MODE
    if (dayParam) {
      const monthAbbr = dayjs().format("MMM").toLowerCase();
      setTargetImg(`/${monthAbbr}-${dayParam}.png`);
      setChallengeDay(dayParam);
    }
  }, [roomId, dayParam]);

  /* =====================================================
     SUBMIT & SCORE
  ===================================================== */
  const handleCheckMatch = async (): Promise<void> => {
    try {
      const iframe = document.querySelector(
        "iframe"
      ) as HTMLIFrameElement | null;

      if (!iframe?.contentDocument?.body || !targetImg) {
        toast.error("Preview not ready");
        return;
      }

      const canvas = await html2canvas(iframe.contentDocument.body, {
        backgroundColor: null,
      });

      const previewImage = canvas.toDataURL("image/png");
      const similarity = await compareImages(targetImg, previewImage);

      setMatchScore(similarity);

      // save solo score
      await fetch("/api/score/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          day: challengeDay,
          score: similarity,
        }),
      });

      // save room score
      if (roomId) {
        await fetch(`/api/challenge/room/${roomId}/score`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ score: similarity }),
        });
      }

      toast.success(`Image matched ${similarity}%`);
      onSubmitted?.();
    } catch (err) {
      console.error(err);
      toast.error("Comparison failed");
    }
  };

  /* =====================================================
     COLOR PALETTE
  ===================================================== */
  useEffect(() => {
    if (!targetImg) return;

    getColorPalette(targetImg)
      .then(setColors)
      .catch(() => setColors([]));
  }, [targetImg]);

  /* =====================================================
     LOADING
  ===================================================== */
  if (!targetImg) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-400">
        Loading challenge…
      </div>
    );
  }

  /* =====================================================
     UI
  ===================================================== */
  return (
    <div className="flex w-full bg-[#0d0d0d] text-white overflow-hidden pt-[80px] h-[calc(100vh-80px)]">
      {/* LEFT */}
      <div className="w-1/3 h-full border-r border-purple-500/20 flex flex-col">
        <div className="flex-1">
          <CodeEditor code={code} setCode={setCode} />
        </div>

        <div className="h-[18vh] flex flex-col items-center justify-center border-t border-purple-500/20 bg-[#111] p-2">
          <button
            onClick={handleCheckMatch}
            className="px-6 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg font-semibold"
          >
            Submit
          </button>

          {matchScore !== null && (
            <div className="text-sm text-gray-300 mt-2">
              Your Score:{" "}
              <span className="text-purple-400 font-semibold">
                {matchScore}%
              </span>
            </div>
          )}
        </div>
      </div>

      {/* RIGHT */}
      <div className="w-2/3 h-full flex gap-4 p-4">
        <div className="w-1/2 h-[50vh] flex items-center justify-center bg-[#111] rounded-xl">
          <ComparePreview code={code} targetImage={targetImg} />
        </div>

        <div className="w-1/2 flex flex-col gap-4">
          <div className="h-[50vh] flex items-center justify-center bg-[#111] rounded-xl">
            <img
              src={targetImg}
              alt={`Target ${challengeDay}`}
              className="w-full h-full object-contain rounded-xl"
            />
          </div>

          <div className="h-[20vh] flex items-center justify-around bg-[#111] rounded-xl border border-purple-400/30 p-4">
            {colors.length === 0 ? (
              <span className="text-gray-400 text-sm">No palette</span>
            ) : (
              colors.map((color) => (
                <div
                  key={color}
                  className="flex flex-col items-center cursor-pointer"
                  onClick={() => {
                    navigator.clipboard.writeText(color);
                    toast.success(`${color} copied`);
                  }}
                >
                  <div
                    className="w-10 h-10 rounded-full border border-gray-600 mb-1"
                    style={{ backgroundColor: color }}
                  />
                  <span className="text-sm text-gray-300">{color}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
