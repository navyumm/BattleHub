"use client";
import { useState, useRef } from "react";
import CodeEditor from "./Editor";
import ComparePreview from "./ComparePreview";
import { toast } from "react-hot-toast";
import html2canvas from "html2canvas";
import { compareImages } from "./utils/compareImages";

const colors = ["#e8ad6d", "#3a240d"];

export default function PlayPage() {
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
  const previewRef = useRef<HTMLIFrameElement>(null);

  const copyToClipboard = (color: string) => {
    navigator.clipboard.writeText(color);
    toast.success(`${color} copied!`);
  };

  const handleCheckMatch = async () => {
    try {
      const iframe = document.querySelector("iframe");
      const targetImg = "/target3.png";

      if (!iframe?.contentDocument?.body) {
        toast.error("Preview not ready");
        return;
      }

      // capture preview as image
      const canvas = await html2canvas(iframe.contentDocument.body, {
        backgroundColor: null,
      });
      const previewImage = canvas.toDataURL("image/png");

      // compare target vs preview
      const similarity = await compareImages(targetImg, previewImage);
      setMatchScore(similarity);
      toast.success(`Image matched ${similarity}%`);
    } catch (err) {
      console.error(err);
      toast.error("Comparison failed");
    }
  };

  return (
    <div className="flex w-full bg-[#0d0d0d] text-white overflow-hidden pt-[80px] h-[calc(100vh-80px)]">

      {/* Left: Code Editor */}
      <div className="w-1/3 h-full border-r border-purple-500/20 flex flex-col">
        {/* Editor */}
        <div className="flex-1">
          <CodeEditor code={code} setCode={setCode} />
        </div>

        {/* Button + Score (bottom section) */}
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
              <span className="text-purple-400 font-semibold">{matchScore}%</span>
            </div>
          )}
        </div>
      </div>

      {/* Right Section */}
      <div className="w-2/3 h-full flex gap-4 p-4">

        {/* Center: Live Preview */}
        <div className="w-1/2 h-[50vh] flex items-center justify-center bg-[#111] rounded-xl overflow-hidden">
          <ComparePreview code={code} />
        </div>

        {/* Right: Target Image + Palette */}
        <div className="w-1/2 flex flex-col gap-4">
          
          {/* Target Image */}
          <div className="h-[50vh] flex items-center justify-center bg-[#111] rounded-xl shadow-lg">
            <img
              src="/target3.png"
              alt="Target"
              className="w-full h-full object-contain rounded-xl"
            />
          </div>

          {/* Color Palette */}
          <div className="h-[20vh] flex items-center justify-around bg-[#111] rounded-xl border border-purple-400/30 p-4">
            {colors.map((color) => (
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
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
