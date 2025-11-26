export default function Footer() {
  return (
    <footer className="text-center text-gray-400 py-4 border-t border-purple-500/30 text-sm bg-black backdrop-blur-md">
      © {new Date().getFullYear()} BattleHub — Made with ❤️ using Next.js
    </footer>
  );
}