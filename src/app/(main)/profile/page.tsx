"use client";
import axios from "axios";
import React, { useState } from "react";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<{
    username?: string;
    email?: string;
    isVerified?: boolean;
  } | null>(null);

  const logout = async () => {
    try {
      await axios.get("/api/users/logout");
      toast.success("Logout successful 🎉");
      router.push("/");
    } catch (error: any) {
      console.log(error.message);
      toast.error(error.message);
    }
  };

  const getUserDetails = async () => {
    try {
      const res = await axios.get("/api/users/me");
      console.log(res.data);
      setUser(res.data.data);
    } catch (error: any) {
      console.log(error.message);
      toast.error("Failed to load user details");
    }
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-black via-[#120019] to-[#1e1b4b] text-white p-8">
      <div className="bg-black/60 backdrop-blur-xl border border-purple-500/30 rounded-2xl shadow-2xl p-10 w-full max-w-2xl text-center">
        <h1 className="text-3xl font-bold mb-3 text-orange-400">
          Welcome to Your Battle Zone ⚡
        </h1>
        <p className="text-gray-300 mb-6">
          Manage your profile, view your progress, and keep battling!
        </p>

        {/* User Info */}
        {user ? (
          <div className="text-left bg-purple-900/20 border border-purple-500/20 rounded-xl p-6 mb-6">
            <p className="mb-2">
              <span className="text-purple-300 font-semibold">Username:</span>{" "}
              <span className="text-orange-400">{user.username}</span>
            </p>
            <p className="mb-2">
              <span className="text-purple-300 font-semibold">Email:</span>{" "}
              <span className="text-orange-400">{user.email}</span>
            </p>
            <p>
              <span className="text-purple-300 font-semibold">Verified:</span>{" "}
              <span
                className={`font-bold ${
                  user.isVerified ? "text-green-400" : "text-red-400"
                }`}
              >
                {user.isVerified ? "Yes ✅" : "No ❌"}
              </span>
            </p>
          </div>
        ) : (
          <p className="text-gray-400 mb-6">
            Click “Get User Details” to load your profile info.
          </p>
        )}

        {/* Buttons */}
        <div className="flex justify-center gap-4">
          <button
            onClick={getUserDetails}
            className="px-5 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition-all font-semibold"
          >
            Get User Details
          </button>
          <button
            onClick={logout}
            className="px-5 py-2 bg-orange-600 hover:bg-orange-700 rounded-lg transition-all font-semibold"
          >
            Logout
          </button>
        </div>
      </div>
    </main>
  );
}