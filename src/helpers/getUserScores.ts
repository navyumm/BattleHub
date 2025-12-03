export async function getUserScores(): Promise<Record<number, number>> {
  try {
    const res = await fetch("/api/score/get", {
      method: "GET",
      credentials: "include",
    });

    if (!res.ok) return {};

    const data = await res.json();

    const result: Record<number, number> = {};

    (data.scores || []).forEach((item: any) => {
      result[Number(item.day)] = item.score;
    });

    return result;
  } catch (error) {
    console.error("Failed to fetch scores:", error);
    return {};
  }
}
