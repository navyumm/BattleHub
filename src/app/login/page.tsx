"use client";
import Link from "next/link";
import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { toast } from "react-hot-toast";

export default function LoginPage() {
  const router = useRouter();
  const [user, setUser] = React.useState({ email: "", password: "" });
  const [buttonDisabled, setButtonDisabled] = React.useState(true);
  const [loading, setLoading] = React.useState(false);

  const onLogin = async () => {
    try {
      setLoading(true);
      const response = await axios.post("/api/users/login", user);
      toast.success("Login successful 🎉");
      router.push("/play");
    } catch (error: any) {
      toast.error( "please verify your OTP first");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user.email && user.password) setButtonDisabled(false);
    else setButtonDisabled(true);
  }, [user]);

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-black">
      <div className="bg-black/60 backdrop-blur-md border border-purple-500/30 rounded-2xl shadow-2xl p-8 w-full max-w-md">
        {/* Title */}
        <h1 className="text-3xl font-bold text-white text-center mb-3">
          {loading ? "Processing..." : "Welcome Back"}
        </h1>

        {/* Subtitle + Underline */}
        <div className="text-center mb-8">
          <p className="text-gray-300">Login to continue your Battle journey 🚀</p>
          <div className="w-32 h-[3px] mx-auto mt-2 rounded-full bg-gradient-to-r from-orange-500 via-purple-600 to-orange-500"></div>
        </div>

        {/* Inputs */}
        <div className="flex flex-col">
          <label htmlFor="email" className="text-gray-200 mb-1 font-medium">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={user.email}
            onChange={(e) => setUser({ ...user, email: e.target.value })}
            placeholder="one@gmail.com"
            className="p-3 mb-4 rounded-lg bg-white/10 text-white placeholder-gray-400 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-orange-400 transition-all"
          />

          <label htmlFor="password" className="text-gray-200 mb-1 font-medium">
            Password
          </label>
          <input
            id="password"
            type="password"
            value={user.password}
            onChange={(e) => setUser({ ...user, password: e.target.value })}
            placeholder="••••••••"
            className="p-3 mb-6 rounded-lg bg-white/10 text-white placeholder-gray-400 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-orange-400 transition-all"
          />

          {/* Button */}
          <button
            onClick={onLogin}
            disabled={buttonDisabled || loading}
            className={`w-full py-3 font-semibold text-lg rounded-lg transition-all duration-300 ${
              buttonDisabled || loading
                ? "bg-gray-500 cursor-not-allowed"
                : "bg-orange-600 hover:shadow-lg hover:scale-[1.01] text-white"
            }`}
          >
            {loading ? "Logging in..." : "Login"}
          </button>

          {/* Footer */}
          <p className="text-center text-gray-300 mt-6">
            Don’t have an account?{" "}
            <Link
              href="/signup"
              className="text-orange-400 hover:text-orange-300 font-semibold transition-all"
            >
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}