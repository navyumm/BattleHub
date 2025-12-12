"use client";

import PlayPage from "@/app/(main)/play/page";

export default function PlayWrapper({ params }: { params: { day: string } }) {
  const dayNumber = Number(params.day);

  return <PlayPage day={dayNumber} />;
}
