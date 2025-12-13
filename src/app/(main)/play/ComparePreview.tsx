"use client";
import { ReactCompareSlider } from "react-compare-slider";

export default function ComparePreview({
  code,
  targetImage,
}: {
  code: string;
  targetImage: string;
}) {
  const hasImage = targetImage && targetImage.trim() !== "";

  return (
    <div className="w-full h-full">
      <ReactCompareSlider
        itemOne={
          <iframe
            srcDoc={code}
            className="w-full h-full"
            sandbox="allow-scripts allow-same-origin"
          />
        }
        itemTwo={
          hasImage ? (
            <img
              src={targetImage}
              alt="Target"
              className="w-full h-full object-contain"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              Loading target…
            </div>
          )
        }
        position={50}
        changePositionOnHover={true}
        onlyHandleDraggable={true}
        className="w-full h-full"
      />
    </div>
  );
}
