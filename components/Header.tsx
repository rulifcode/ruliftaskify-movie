import Link from "next/link";

export default function Header() {
  return (
    <header className="sticky top-0 z-50 grid grid-cols-3 items-center px-10 h-16 bg-[#080a0f]/80 backdrop-blur-md border-b border-white/[0.07]">
      <nav className="flex items-center gap-7">
        {["Discover", "Trending", "Top Rated", "Genres"].map((n, i) => (
          <a key={n} href="#"
            className={`text-xs font-semibold tracking-wider transition-colors ${i === 0 ? "text-white" : "text-white/40 hover:text-white"}`}>
            {n}
          </a>
        ))}
      </nav>
      <div className="flex justify-center">
        <span className="font-black text-xl tracking-widest uppercase">
          Rulif<span className="text-red-500">Taskify</span>
        </span>
      </div>
      <div className="flex justify-end">
        <Link href="/login"
          className="text-xs font-semibold tracking-wider px-4 py-2 border border-white/20 rounded-lg text-white/70 hover:text-white hover:border-white/50 transition-all">
          Sign In
        </Link>
      </div>
    </header>
  );
}