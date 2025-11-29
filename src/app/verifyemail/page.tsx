"use client";

import axios from "axios";
import Link from "next/link";
import React, { useRef, useState } from "react";

export default function VerifyEmailPage() {
  const [otp, setOtp] = useState<string[]>(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [verified, setVerified] = useState(false);
  const [error, setError] = useState("");

  const inputs = useRef<any>([]);

  const handleChange = (value: string, index: number) => {
    if (!/^[0-9]$/.test(value) && value !== "") return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) inputs.current[index + 1].focus();
  };

  const handleKeyDown = (e: any, index: number) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputs.current[index - 1].focus();
    }
  };

  const verifyOtp = async () => {
    try {
      setLoading(true);
      setError("");

      const finalOtp = otp.join("");

      const response = await axios.post("/api/users/verifyemail", { otp: finalOtp });

      if (response.data.success) {
        setVerified(true);
      } else {
        setError("Invalid OTP! Please try again");
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || "Invalid or expired OTP");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6 bg-gradient-to-br from-black via-[#1a0025] to-[#0f0015] text-white">

      {!verified ? (
        /* ================================ VERIFY BOX =============================== */
        <div className="w-full max-w-md bg-black/40 p-10 rounded-2xl border border-purple-600/30 shadow-[0_0_25px_rgba(147,51,234,0.3)] backdrop-blur-md">

          <h1 className="text-4xl font-extrabold text-center mb-4 tracking-wide">
            <span className="text-orange-400">Verify OTP</span>
          </h1>

          <p className="text-gray-300 text-center mb-6">
            Enter the 6-digit code to activate your BattleHub account.
          </p>

          {/* =============================== OTP BOXES =============================== */}
          <div className="flex justify-between gap-3 mb-4">
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={(el) => (inputs.current[index] = el)}
                value={digit}
                onChange={(e) => handleChange(e.target.value, index)}
                onKeyDown={(e) => handleKeyDown(e, index)}
                maxLength={1}
                className="w-12 h-14 text-center text-2xl font-bold rounded-xl 
                bg-[#1a0025] border border-purple-600/30 
                focus:border-orange-500 focus:ring-2 focus:ring-orange-500 
                outline-none transition"
              />
            ))}
          </div>

          {error && <p className="text-red-500 text-center text-sm">{error}</p>}

          <button
            onClick={verifyOtp}
            disabled={loading || otp.join("").length < 6}
            className="w-full mt-6 py-3 rounded-xl text-lg font-semibold 
            bg-gradient-to-r from-orange-500 to-orange-600
            hover:scale-105 transition-all disabled:bg-gray-600"
          >
            {loading ? "Verifying..." : "Verify OTP"}
          </button>
        </div>

      ) : (
        /* ================================ SUCCESS =============================== */
        <div className="text-center bg-black/40 p-10 rounded-2xl border border-green-600/30 shadow-[0_0_30px_rgba(34,197,94,0.3)]">

          <h2 className="text-3xl font-bold text-green-500 mb-3">Verification Successful ✔</h2>

          <p className="text-gray-300 mb-6">
            Your BattleHub account is now activated
          </p>

          <Link
            href="/play"
            className="px-8 py-3 bg-gradient-to-r from-purple-600 to-purple-700 
            hover:scale-105 rounded-xl font-semibold text-white"
          >
            Enter Battle Arena
          </Link>
        </div>
      )}
    </div>
  );
}
