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

export default function PlayPage() {
  const params = useParams();
  const dayParam = params?.day || "1";

  const [code, setCode] = useState(`
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

  const [matchScore, setMatchScore] = useState<number | null>(null);
  const [colors, setColors] = useState<string[]>([]);

  const monthAbbr = dayjs().format("MMM").toLowerCase();
  const targetImg = `/${monthAbbr}-${dayParam}.png`;

  const copyToClipboard = (color: string) => {
    navigator.clipboard.writeText(color);
    toast.success(`${color} copied!`);
  };

  const handleCheckMatch = async () => {
    try {
      const iframe = document.querySelector("iframe");
      if (!iframe?.contentDocument?.body) {
        toast.error("Preview not ready");
        return;
      }

      const canvas = await html2canvas(iframe.contentDocument.body, {
        backgroundColor: null,
      });
      const previewImage = canvas.toDataURL("image/png");
      const similarity = await compareImages(targetImg, previewImage);
      setMatchScore(similarity);
      toast.success(`Image matched ${similarity}%`);
    } catch (err) {
      console.error(err);
      toast.error("Comparison failed");
    }
  };

  useEffect(() => {
    // Fetch dynamic palette for target image
    getColorPalette(targetImg)
      .then((palette) => setColors(palette))
      .catch(() => setColors([]));
  }, [targetImg]);

  return (
    <div className="flex w-full bg-[#0d0d0d] text-white overflow-hidden pt-[80px] h-[calc(100vh-80px)]">
      <div className="w-1/3 h-full border-r border-purple-500/20 flex flex-col">
        <div className="flex-1">
          <CodeEditor code={code} setCode={setCode} />
        </div>

        <div className="h-[18vh] flex flex-col items-center justify-center border-t border-purple-500/20 bg-[#111] p-2">
          <button
            onClick={handleCheckMatch}
            className="px-6 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition"
          >
            Submit
          </button>
          {matchScore !== null && (
            <div className="text-sm text-gray-300">
              Your Score:{" "}
              <span className="text-purple-400 font-semibold">
                {matchScore}%
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="w-2/3 h-full flex gap-4 p-4">
        <div className="w-1/2 h-[50vh] flex items-center justify-center bg-[#111] rounded-xl overflow-hidden">
          <ComparePreview code={code} targetImage={targetImg} />
        </div>

        <div className="w-1/2 flex flex-col gap-4">
          <div className="h-[50vh] flex items-center justify-center bg-[#111] rounded-xl shadow-lg">
            <img
              src={targetImg}
              alt={`Target ${dayParam}`}
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
                  onClick={() => copyToClipboard(color)}
                >
                  <div
                    className="w-10 h-10 rounded-full border border-gray-600 mb-1"
                    style={{ backgroundColor: color }}
                  ></div>
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
