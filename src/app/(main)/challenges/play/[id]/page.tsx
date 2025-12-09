"use client";

export default function ChallengePlay() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-[#120019] to-[#000000] text-white flex flex-col items-center pt-28 px-6">

      <h1 className="text-4xl font-bold text-orange-400 mb-6">
        Challenge Started!
      </h1>

      <div className="bg-black/60 backdrop-blur-xl border border-purple-500/30 rounded-2xl shadow-2xl p-8 w-full max-w-2xl text-center">
        <p className="text-gray-300 text-lg">
          Here the CSS Challenge UI will appear for both players.
        </p>
        <p className="text-gray-400 text-sm mt-4">
          (We will integrate real gameplay + scoring next)
        </p>
      </div>

    </div>
  );
}
