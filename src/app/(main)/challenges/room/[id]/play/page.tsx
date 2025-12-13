"use client";

import PlayPage from "@/app/(main)/play/page";

export default function RoomPlayPage({
  params,
}: {
  params: { id: string };
}) {
  const { id } = params;

  return <PlayPage isRoomMode={true} roomId={id} />;
}
