"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import axios from "axios";
import { toast } from "react-hot-toast";

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();

  const logout = async () => {
    try {
      await axios.get("/api/users/logout");
      toast.success("Logout successful 🎉");
      router.push("/");
    } catch (error: any) {
      toast.error("Logout failed!");
      console.log(error.message);
    }
  };

  const linkClass = (path: string) =>
    `transition font-semibold ${
      pathname === path
        ? "text-purple-400"
        : "hover:text-orange-300 text-white"
    }`;

  return (
    <nav className="flex justify-between items-center px-10 py-4 border-b border-purple-500/30 bg-black/40 backdrop-blur-md fixed top-0 w-full z-50">
      <Link href="/play" className="text-2xl font-extrabold text-orange-400 tracking-wide">
        ⚔️ BattleHub
      </Link>
      <div className="flex items-center gap-6">
        <Link href="/play" className={linkClass("/play")}>
          Play
        </Link>
        <Link href="/leaderboard" className={linkClass("/leaderboard")}>
          Leaderboard
        </Link>
        <Link href="/profile" className={linkClass("/profile")}>
          Profile
        </Link>

        {/* Logout Button */}
        <button
          onClick={logout}
          className="px-4 py-2 bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg hover:scale-105 transition-all font-semibold"
        >
          Logout
        </button>
      </div>
    </nav>
  );
}
