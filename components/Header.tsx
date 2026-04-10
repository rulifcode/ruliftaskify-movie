"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Header() {
  const pathname = usePathname();

  const navItems = [
    { label: "Home", href: "/" },
    { label: "Movies", href: "/movies" },
    { label: "Series", href: "/series" },
    { label: "Upcoming", href: "/upcoming" },
  ];

  return (
    <header className="sticky top-0 z-50 grid grid-cols-3 items-center px-10 h-16 bg-[#080a0f]/80 backdrop-blur-md border-b border-white/[0.07]">
      <nav className="flex items-center gap-7">
        {navItems.map((item) => (
          <Link
            key={item.label}
            href={item.href}
            className={`text-xs font-semibold tracking-wider transition-colors ${
              pathname === item.href ? "text-white" : "text-white/40 hover:text-white"
            }`}
          >
            {item.label}
          </Link>
        ))}
      </nav>

      <div className="flex justify-center">
        <Link href="/" className="font-black text-xl tracking-widest uppercase text-white">
          Rulif<span className="text-red-500">Taskify</span>
        </Link>
      </div>

      <div className="flex justify-end items-center gap-3">
        <Link
          href="/auth"
          className="text-xs font-semibold tracking-wider px-4 py-2 border border-white/20 hover:border-white/40 hover:text-white transition-colors rounded-lg text-white/80"
        >
          Sign In
        </Link>
        <Link
          href="/auth"
          className="text-xs font-semibold tracking-wider px-4 py-2 bg-red-600 hover:bg-red-500 transition-colors rounded-lg text-white"
        >
          Sign Up
        </Link>
      </div>
    </header>
  );
}