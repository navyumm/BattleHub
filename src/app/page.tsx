"use client";
import Link from "next/link";
import React from "react";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-black via-[#1a0025] to-[#2b003a] text-white font-sans">
      {/* ================= Navbar ================= */}
      <nav className="flex justify-between items-center px-10 py-5 border-b border-purple-500/30 bg-black/40 backdrop-blur-md fixed top-0 w-full z-50">
        <Link href="/" className="text-2xl font-extrabold text-orange-400 tracking-wide">
          ⚔️ BattleHub
        </Link>

        <div className="flex items-center gap-8 text-lg font-medium">
          <Link href="#about" className="hover:text-orange-300 transition">
            About Us
          </Link>
          <Link
            href="/login"
            className="px-5 py-2 rounded-lg bg-gradient-to-r from-orange-500 to-orange-600 hover:scale-105 transition-all"
          >
            Login
          </Link>
          <Link
            href="/signup"
            className="px-5 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-purple-700 hover:scale-105 transition-all"
          >
            Sign Up
          </Link>
        </div>
      </nav>

      {/* ================= Hero Section ================= */}
      <section className="flex flex-col items-center justify-center text-center flex-1 px-6 pt-32 pb-20">
        <h1 className="text-5xl md:text-6xl font-extrabold text-white leading-tight">
          Master the Art of <span className="text-orange-400">Coding Battles</span>
        </h1>
        <p className="text-gray-300 mt-6 text-lg md:text-xl max-w-2xl">
          Join <span className="text-purple-400 font-semibold">BattleHub</span> — where developers challenge, learn, and grow together.
          Compete in creative coding challenges, track your progress, and climb the leaderboard!
        </p>

        <div className="flex gap-6 mt-10">
          <Link
            href="/signup"
            className="px-8 py-3 bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl text-lg font-semibold hover:scale-105 transition-all"
          >
            Get Started
          </Link>
          <Link
            href="/login"
            className="px-8 py-3 border border-purple-500 text-purple-300 rounded-xl text-lg font-semibold hover:bg-purple-800/40 transition-all"
          >
            Already have an account?
          </Link>
        </div>
      </section>

      {/* ================= About Section ================= */}
      <section
        id="about"
        className="py-20 px-8 md:px-20 bg-gradient-to-t from-[#14001b] via-[#1a0025] to-transparent border-t border-purple-500/20"
      >
        <h2 className="text-4xl font-bold text-center mb-8 text-orange-400">About Us</h2>
        <p className="text-center text-gray-300 max-w-3xl mx-auto text-lg leading-relaxed">
          BattleHub is a coding arena built for passionate developers. Whether you’re a beginner
          honing your skills or an experienced coder looking for new challenges — BattleHub offers
          exciting problems, live contests, and a thriving community to keep you motivated.
        </p>

        <div className="grid md:grid-cols-3 gap-8 mt-16 text-center">
          <div className="p-6 bg-black/40 rounded-2xl border border-purple-600/20 hover:border-orange-500/40 transition-all">
            <h3 className="text-xl font-semibold mb-3 text-orange-400">💡 Learn & Grow</h3>
            <p className="text-gray-400">
              Sharpen your skills through real-world coding problems and interactive learning.
            </p>
          </div>
          <div className="p-6 bg-black/40 rounded-2xl border border-purple-600/20 hover:border-orange-500/40 transition-all">
            <h3 className="text-xl font-semibold mb-3 text-orange-400">⚔️ Compete & Win</h3>
            <p className="text-gray-400">
              Participate in challenges, earn rewards, and climb the leaderboard of legends.
            </p>
          </div>
          <div className="p-6 bg-black/40 rounded-2xl border border-purple-600/20 hover:border-orange-500/40 transition-all">
            <h3 className="text-xl font-semibold mb-3 text-orange-400">🌐 Community</h3>
            <p className="text-gray-400">
              Connect with fellow developers, share ideas, and collaborate on exciting projects.
            </p>
          </div>
        </div>
      </section>

      {/* ================= Footer ================= */}
      <footer className="border-t border-purple-500/20 py-6 text-center text-gray-400 text-sm bg-black/40 backdrop-blur-md">
        <p>
          © {new Date().getFullYear()} <span className="text-orange-400 font-semibold">BattleHub</span>. All rights reserved.
        </p>
        <p className="mt-1">
          Built with ❤️ by passionate developers using <span className="text-purple-400">Next.js</span>.
        </p>
      </footer>
    </div>
  );
}