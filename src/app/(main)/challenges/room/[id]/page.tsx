"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { io, Socket } from "socket.io-client";
import PlayPage from "@/app/(main)/play/page";

type Player = {
  id: string;
  username: string;
  score?: number | null;
};

export default function RoomPage() {
  const { id } = useParams();
  const router = useRouter();

  const [players, setPlayers] = useState<Player[]>([]);
  const [room, setRoom] = useState<any>(null);
  const [loggedUserId, setLoggedUserId] = useState<string | null>(null);

  const joinedRef = useRef(false);
  const socketRef = useRef<Socket | null>(null);

  /* -------------------------------- JOIN ROOM -------------------------------- */
  useEffect(() => {
    if (!id || joinedRef.current) return;
    joinedRef.current = true;

    fetch("/api/challenge/join", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ roomId: id }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (!data.success || !data.room) return;

        setPlayers(data.room.players);
        setRoom(data.room);
        setLoggedUserId(String(data.userId));

        if (data.room.started && data.room.challenge?.day) {
          router.push(`/play/${data.room.challenge.day}?roomId=${id}`);
        }
      })
      .catch(console.error);
  }, [id, router]);

  /* ------------------------------- SOCKET SETUP ------------------------------- */
useEffect(() => {
  if (!id) return;

  // 🔥 important: pehle server init
  fetch("/api/socket").then(() => {
    const socket = io({
      path: "/api/socket",
      transports: ["websocket"],
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      console.log("SOCKET CONNECTED:", socket.id);
      socket.emit("join-room", id);
    });

    socket.on("challenge-started", ({ day }) => {
      router.push(`/play/${day}?roomId=${id}`);
    });
  });

  return () => {
    socketRef.current?.disconnect();
  };
}, [id]);

  /* -------------------------------- HOST CHECK -------------------------------- */
  const isHost =
    loggedUserId && room?.ownerId
      ? String(loggedUserId) === String(room.ownerId)
      : false;

  /* --------------------------- HOST SELECT CHALLENGE --------------------------- */
const handleSelectChallenge = async (day: number, image: string) => {
  try {
    const res = await fetch("/api/challenge/select", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ roomId: id, day, image }),
    });

    const data = await res.json();
    if (!data.success) return;

    router.push(`/play/${day}?roomId=${id}`);
  } catch (error) {
    console.error("Select challenge error:", error);
  }
};


  /* ---------------------------------- UI ---------------------------------- */
  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-[#120019] to-black text-white flex flex-col items-center pt-24 px-6">
      <h1 className="text-3xl font-bold text-orange-400 mb-6 text-center">
        Room ID: {id}
      </h1>

      {/* Players */}
      <div className="bg-black/60 border border-purple-500/30 rounded-2xl p-8 w-full max-w-md mb-8">
        <h2 className="text-xl font-semibold text-purple-300 mb-4">
          Players
        </h2>

        {players.map((player) => (
          <div
            key={player.id}
            className="px-4 py-3 bg-[#111] rounded-lg border border-purple-500/20 text-lg mb-2"
          >
            {player.username}
          </div>
        ))}
      </div>

      {/* HOST — SELECT CHALLENGE */}
      {!room?.challenge && isHost && (
        <PlayPage
          isRoomMode
          roomId={id}
          onSelectChallenge={handleSelectChallenge}
        />
      )}

      {/* NON-HOST — WAITING */}
      {!room?.challenge && !isHost && (
        <p className="text-gray-400 text-lg mt-6">
          Waiting for host to select a challenge…
        </p>
      )}

      {/* AFTER CHALLENGE SELECTED */}
      {room?.challenge && (
        <div className="mt-10 bg-black/60 border border-purple-500/30 p-6 rounded-2xl w-full max-w-lg text-center">
          <h2 className="text-2xl font-bold text-purple-400 mb-4">
            Challenge Selected – Day {room.challenge.day}
          </h2>

          <img
            src={room.challenge.image}
            alt="Challenge preview"
            className="w-full max-h-64 object-contain rounded-xl"
          />
        </div>
      )}
    </div>
  );
}
