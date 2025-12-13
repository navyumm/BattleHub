"use client";

import React, { useEffect, useState, useRef, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import CodeEditor from "@/app/(main)/play/Editor"; // <- adjust if your Editor path differs
import ComparePreview from "@/app/(main)/play/ComparePreview"; // <- adjust if your ComparePreview path differs
import { compareImages } from "@/app/(main)/play/utils/compareImages"; // <- adjust path if needed
import html2canvas from "html2canvas";
import dayjs from "dayjs";
import { toast } from "react-hot-toast";

/**
 * Multiplayer challenge play page (polling implementation)
 * - Shows editor, live preview, target image
 * - Timer auto-submits
 * - Polls /api/challenge/room/:id for updated players & scores
 */

export default function ChallengePlayPage() {
  const { id: roomId } = useParams() as { id?: string };
  const router = useRouter();

  const [code, setCode] = useState<string>(`<div></div>
<style>
body { background: #191919; }
div { width: 100px; height: 100px; background: orange; border-radius: 50%; margin: 90px auto; }
</style>`);

  const [targetImage, setTargetImage] = useState<string | null>(null);
  const [players, setPlayers] = useState<
    { id: string; username: string; score?: number | null }[]
  >([]);
  const [timeLeft, setTimeLeft] = useState<number>(180); // default 3 minutes; you can override from room.challenge.duration
  const [started, setStarted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const iframeRef = useRef<HTMLIFrameElement | null>(null); // optional if you need direct iframe access
  const pollingRef = useRef<number | null>(null);

  // load room initial meta (challenge, players, timer)
  const loadRoomState = useCallback(async () => {
    if (!roomId) return;
    try {
      const res = await fetch(`/api/challenge/room/${roomId}`);
      if (!res.ok) {
        // room missing or bad
        // console.warn("room fetch failed", await res.text());
        return;
      }
      const data = await res.json();
      if (!data?.room) return;

      // challenge may carry targetImage, duration, etc.
      const room = data.room;
      if (room.challenge?.targetImage) {
        setTargetImage(room.challenge.targetImage);
      } else {
        // fallback: current month/day image (same as Play)
        const d = dayjs();
        const month = d.format("MMM").toLowerCase();
        const day = String(room.challenge?.day || d.date());
        setTargetImage(`/${month}-${day}.png`);
      }

      if (typeof room.challenge?.duration === "number") {
        setTimeLeft(room.challenge.duration);
      }

      setPlayers(Array.isArray(room.players) ? room.players : []);
      setStarted(Boolean(room.started));
    } catch (err) {
      console.error("loadRoomState error", err);
    }
  }, [roomId]);

  // poll for room updates (players, started, scores)
  useEffect(() => {
    if (!roomId) return;
    // immediate load
    loadRoomState();

    const poll = async () => {
      await loadRoomState();
    };
    // poll every 1200ms
    pollingRef.current = window.setInterval(poll, 1200);
    return () => {
      if (pollingRef.current) window.clearInterval(pollingRef.current);
    };
  }, [roomId, loadRoomState]);

  // timer countdown only when started
  useEffect(() => {
    if (!started) return;
    if (timeLeft <= 0) return;

    const t = setInterval(() => {
      setTimeLeft((s) => {
        if (s <= 1) {
          clearInterval(t);
          // auto-submit when hits zero
          (async () => {
            try {
              await submitScore(); // auto submit
            } catch (e) {
              /* ignore */
            }
          })();
          return 0;
        }
        return s - 1;
      });
    }, 1000);

    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [started]);

  // if room becomes started (via polling), navigate to same page's started state (we are already here)
  useEffect(() => {
    if (started) {
      toast("Challenge started! Timer running.");
    }
  }, [started]);

  // submit current user's score: capture preview, compare and send to APIs
  const submitScore = useCallback(async () => {
    if (!roomId) {
      toast.error("Missing room id");
      return;
    }
    if (submitting) return;
    setSubmitting(true);
    try {
      // capture preview from iframe by rendering its body with html2canvas
      // We can render from the ComparePreview iframe — the easiest is to render iframe contentDocument body
      const iframe = document.querySelector("iframe");
      if (!iframe || !("contentDocument" in iframe) || !iframe.contentDocument) {
        toast.error("Preview not ready");
        setSubmitting(false);
        return;
      }

      const canvas = await html2canvas(iframe.contentDocument.body, { backgroundColor: null });
      const previewDataUrl = canvas.toDataURL("image/png");

      // compare with target image path (targetImage must be a url)
      if (!targetImage) {
        toast.error("Target image missing");
        setSubmitting(false);
        return;
      }

      const similarity = await compareImages(targetImage, previewDataUrl);
      const rounded = Math.round(similarity);

      // 1) save to DB via existing endpoint
      await fetch("/api/score/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ day: String(new Date().getDate()), score: rounded }),
      });

      // 2) update room state (so other player sees the score immediately)
      await fetch(`/api/challenge/room/${roomId}/score`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ score: rounded }),
      });

      toast.success(`Submitted — Score ${rounded}%`);
    } catch (err) {
      console.error("submitScore error", err);
      toast.error("Submit failed");
    } finally {
      setSubmitting(false);
    }
  }, [roomId, targetImage, submitting]);

  // helper to format timeLeft mm:ss
  const formatTime = (s: number) => {
    const mm = Math.floor(s / 60)
      .toString()
      .padStart(2, "0");
    const ss = Math.floor(s % 60)
      .toString()
      .padStart(2, "0");
    return `${mm}:${ss}`;
  };

  if (!roomId) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white">
        <div className="text-center">
          <h2 className="text-2xl font-semibold">No room id</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-[#120019] to-[#000000] text-white pt-28 pb-10 px-6">
      <div className="max-w-6xl mx-auto">
        {/* Header: room id + timer + player list */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-orange-400">Room: {roomId}</h1>
            <div className="text-sm text-gray-300">Players: {players.map((p) => p.username).join(", ")}</div>
          </div>

          <div className="text-center">
            <div className="text-sm text-gray-300">Time left</div>
            <div className="text-2xl font-bold text-purple-400">{formatTime(timeLeft)}</div>
          </div>
        </div>

        {/* Main layout: Editor | Preview | Target */}
        <div className="grid grid-cols-3 gap-4 h-[68vh]">
          {/* Editor */}
          <div className="col-span-1 bg-black/60 backdrop-blur-md border border-purple-500/20 rounded-2xl p-4">
            <div className="h-full rounded-md overflow-hidden">
              <CodeEditor code={code} setCode={setCode} />
            </div>
          </div>

          {/* Preview (compare) */}
          <div className="col-span-1 bg-black/60 backdrop-blur-md border border-purple-500/20 rounded-2xl p-4 flex flex-col">
            <div className="flex-1 rounded-md overflow-hidden">
              <ComparePreview code={code} targetImage={targetImage || ""} />
            </div>

            <div className="mt-4 flex gap-3 items-center">
              <button
                onClick={async () => {
                  // manual submit
                  await submitScore();
                }}
                disabled={submitting}
                className="px-4 py-2 bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl font-semibold"
              >
                {submitting ? "Submitting..." : "Submit Now"}
              </button>

              <button
                onClick={() => {
                  // quick snapshot/preview capture (optional)
                  toast("Preview captured (use Submit to score)", { icon: "📸" });
                }}
                className="px-3 py-2 bg-purple-700 rounded-xl font-medium"
              >
                Snapshot
              </button>
            </div>
          </div>

          {/* Target image and palette / other info */}
          <div className="col-span-1 bg-black/60 backdrop-blur-md border border-purple-500/20 rounded-2xl p-4 flex flex-col">
            <div className="flex-1 rounded-md overflow-hidden bg-[#111] flex items-center justify-center">
              {targetImage ? (
                // keep it centered and responsive
                // make sure your target image exists at the provided URL
                <img src={targetImage} alt="Target" className="max-h-full max-w-full object-contain" />
              ) : (
                <div className="text-gray-500">No target image</div>
              )}
            </div>

            <div className="mt-4 text-sm text-gray-300">
              <div>Players & Scores</div>
              <div className="mt-2 space-y-2">
                {players.map((p) => (
                  <div key={p.id} className="flex justify-between">
                    <div>{p.username}</div>
                    <div className="text-purple-300">{typeof p.score === "number" ? `${p.score}%` : "--"}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
