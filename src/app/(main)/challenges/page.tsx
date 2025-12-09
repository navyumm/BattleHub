"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function ChallengesPage() {
  const router = useRouter();
  const [roomId, setRoomId] = useState("");

  const createRoom = () => {
    const id = Math.random().toString(36).substring(2, 8);
    router.push(`/challenges/room/${id}`);
  };

  const joinRoom = () => {
    if (!roomId.trim()) return;
    router.push(`/challenges/room/${roomId}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-[#120019] to-[#000000] text-white flex flex-col items-center pt-28 pb-10 px-6">

      <h1 className="text-4xl font-bold text-orange-400 mb-6 text-center">
        Multiplayer CSS Battles
      </h1>

      <p className="text-gray-300 mb-10 text-center max-w-xl">
        Create a room or join an existing one and compete in real-time CSS challenges.
      </p>

      <div className="bg-black/60 backdrop-blur-md border border-purple-500/30 shadow-2xl rounded-2xl p-8 w-full max-w-md flex flex-col items-center">
        
        <button 
          onClick={createRoom}
          className="w-full py-3 mb-6 bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl font-semibold text-lg hover:scale-105 transition-all"
        >
          Create New Room
        </button>

        <div className="w-full flex flex-col gap-4">
          <input
            placeholder="Enter Room ID"
            value={roomId}
            onChange={e => setRoomId(e.target.value)}
            className="w-full px-4 py-3 rounded-xl bg-[#111] border border-purple-500/30 text-white placeholder-gray-400 focus:ring-2 focus:ring-orange-400 outline-none"
          />
          <button 
            onClick={joinRoom}
            className="w-full py-3 bg-purple-600 rounded-xl font-semibold text-lg hover:bg-purple-700 transition-all"
          >
            Join Room
          </button>
        </div>
      </div>
    </div>
  );
}
