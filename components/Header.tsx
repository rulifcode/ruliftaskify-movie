import Link from "next/link";

export default function Header() {
  return (
    <header className="sticky top-0 z-50 grid grid-cols-3 items-center px-10 h-16 bg-[#080a0f]/80 backdrop-blur-md border-b border-white/[0.07]">
      <nav className="flex items-center gap-7">
        {[
          { label: "Home", href: "/" },
          { label: "Movies", href: "#" },
          { label: "Series", href: "#" },
          { label: "Upcoming", href: "#" },
        ].map((item, i) => (
          <Link
            key={item.label}
            href={item.href}
            className={`text-xs font-semibold tracking-wider transition-colors ${
              i === 0 ? "text-white" : "text-white/40 hover:text-white"
            }`}
          >
            {item.label}
          </Link>
        ))}
      </nav>

      <div className="flex justify-center">
        <Link href="/" className="font-black text-xl tracking-widest uppercase">
          Rulif<span className="text-red-500">Taskify</span>
        </Link>
      </div>

      <div className="flex justify-end items-center gap-3">
        <Link
          href="/register"
          className="text-xs font-semibold tracking-wider px-4 py-2 bg-red-600 hover:bg-red-500 transition-colors rounded-lg text-white"
        >
          Sign Up
        </Link>
      </div>
    </header>
  );
}