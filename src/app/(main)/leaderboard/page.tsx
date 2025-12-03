// pages/leaderboard.tsx
"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";

type User = {
  _id: string;
  username: string;
  email: string;
  score: number;
  isVerified: boolean;
};

export default function LeaderboardPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      const res = await axios.get("/api/leaderboard?limit=20");
      if (res.data?.success) {
        setUsers(res.data.data);
      } else {
        setUsers([]);
      }
    } catch (err) {
      console.error(err);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  return (
    <main className="min-h-screen flex flex-col items-center justify-start bg-gradient-to-br from-black via-[#120019] to-[#000000] text-white p-8">
      <div className="w-full max-w-4xl">
        <div className="mb-6 text-center">
          <h1 className="text-4xl font-bold text-orange-400 mt-12">BattleHub Leaderboard</h1>
          <p className="text-gray-300 mt-2">Top players based on challenge scores</p>
        </div>

        <div className="bg-black/60 backdrop-blur-xl border border-purple-500/30 rounded-2xl shadow-2xl p-6">
          <div className="flex justify-between items-center mb-4">
            <div className="text-gray-300">Top players</div>
            <div>
              <button
                onClick={fetchLeaderboard}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition-all font-semibold"
              >
                Refresh
              </button>
            </div>
          </div>

          <div className="w-full overflow-hidden rounded-lg">
            <div className="grid grid-cols-12 gap-3 bg-gradient-to-r from-[#0b0210] to-[#120019] p-3 text-sm font-semibold text-gray-400">
              <div className="col-span-1 text-left">#</div>
              <div className="col-span-6">Player</div>
              <div className="col-span-3 text-right">Score</div>
              <div className="col-span-2 text-right">Status</div>
            </div>

            {loading ? (
              <div className="p-6 text-center text-gray-300">Loading leaderboard...</div>
            ) : users.length === 0 ? (
              <div className="p-6 text-center text-gray-300">No players yet.</div>
            ) : (
              users.map((u, idx) => (
                <div
                  key={u._id}
                  className={`grid grid-cols-12 gap-3 items-center px-4 py-3 border-t border-purple-500/10 ${
                    idx % 2 === 0 ? "bg-black/20" : "bg-black/10"
                  }`}
                >
                  <div className="col-span-1 text-left text-lg font-bold text-orange-400">{idx + 1}</div>

                  <div className="col-span-6 flex items-center gap-3">
                    <div className="h-12 w-12 flex items-center justify-center rounded-xl bg-purple-900/30 border border-purple-500/20">
                      <span className="font-bold text-orange-400">
                        {u.username?.slice(0, 1).toUpperCase() || "U"}
                      </span>
                    </div>
                    <div>
                      <div className="font-semibold text-white">{u.username}</div>
                      <div className="text-xs text-gray-400">{u.email}</div>
                    </div>
                  </div>

                  <div className="col-span-3 text-right font-bold text-lg text-orange-400">{u.score}</div>

                  <div className="col-span-2 text-right">
                    {u.isVerified ? (
                      <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-900/20 text-green-300 font-medium">
                        Verified
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-900/20 text-red-300 font-medium">
                        Not verified
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
