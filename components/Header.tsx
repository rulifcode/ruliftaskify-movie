"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { onAuthStateChanged, signOut, User } from "firebase/auth";
import { auth } from "@/lib/firebase";

// ── Avatar Circle ─────────────────────────────────────────────────────────────
function Avatar({ user, onClick }: { user: User; onClick: () => void }) {
  const initials = user.displayName
    ? user.displayName.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : user.email?.[0].toUpperCase() ?? "U";

  if (user.photoURL) {
    return (
      <button onClick={onClick}
        className="w-8 h-8 rounded-full overflow-hidden border-2 border-white/20 hover:border-red-500/60 transition-all">
        <img src={user.photoURL} alt={user.displayName ?? "avatar"} className="w-full h-full object-cover" />
      </button>
    );
  }

  return (
    <button onClick={onClick}
      className="w-8 h-8 rounded-full bg-red-600 hover:bg-red-500 border-2 border-red-500/40 flex items-center justify-center transition-all">
      <span className="text-[11px] font-black text-white tracking-wide">{initials}</span>
    </button>
  );
}

// ── Dropdown Menu (desktop) ───────────────────────────────────────────────────
function DropdownMenu({ user, onClose, onSignOut }: { user: User; onClose: () => void; onSignOut: () => void }) {
  return (
    <div className="absolute right-0 top-full mt-2 w-56 bg-[#0f1117] border border-white/[0.08] rounded-xl overflow-hidden shadow-xl z-50">
      <div className="px-4 py-3 border-b border-white/[0.06]">
        <p className="text-xs font-bold text-white truncate">{user.displayName ?? "User"}</p>
        <p className="text-[11px] text-white/40 truncate mt-0.5">{user.email}</p>
      </div>
      <div className="py-1">
        <Link href="/profile" onClick={onClose} className="flex items-center gap-3 px-4 py-2.5 text-xs text-white/60 hover:text-white hover:bg-white/[0.04] transition-colors">
          <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 16 16" fill="none">
            <circle cx="8" cy="5" r="3" stroke="currentColor" strokeWidth="1.5"/>
            <path d="M2 13c0-3 2.686-5 6-5s6 2 6 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
          My Profile
        </Link>
        <Link href="/watchlist" onClick={onClose} className="flex items-center gap-3 px-4 py-2.5 text-xs text-white/60 hover:text-white hover:bg-white/[0.04] transition-colors">
          <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 16 16" fill="none">
            <path d="M4 2h8a1 1 0 011 1v10.5l-5-3-5 3V3a1 1 0 011-1z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
          </svg>
          Watchlist
        </Link>
        <Link href="/settings" onClick={onClose} className="flex items-center gap-3 px-4 py-2.5 text-xs text-white/60 hover:text-white hover:bg-white/[0.04] transition-colors">
          <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 16 16" fill="none">
            <circle cx="8" cy="8" r="2.5" stroke="currentColor" strokeWidth="1.5"/>
            <path d="M8 1v1.5M8 13.5V15M1 8h1.5M13.5 8H15M2.93 2.93l1.06 1.06M12.01 12.01l1.06 1.06M2.93 13.07l1.06-1.06M12.01 3.99l1.06-1.06" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
          Settings
        </Link>
      </div>
      <div className="border-t border-white/[0.06] py-1">
        <button onClick={onSignOut} className="w-full flex items-center gap-3 px-4 py-2.5 text-xs text-red-400 hover:text-red-300 hover:bg-red-500/[0.06] transition-colors">
          <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 16 16" fill="none">
            <path d="M6 2H3a1 1 0 00-1 1v10a1 1 0 001 1h3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            <path d="M10.5 11L14 8l-3.5-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M14 8H6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
          Sign Out
        </button>
      </div>
    </div>
  );
}

// ── Unique Menu Icon ──────────────────────────────────────────────────────────
function MenuIcon({ open }: { open: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none" className="transition-all duration-300">
      {open ? (
        // X — dua garis diagonal
        <>
          <line x1="4" y1="4" x2="18" y2="18" stroke="white" strokeWidth="1.8" strokeLinecap="round"
            style={{ transition: "all 0.3s" }} />
          <line x1="18" y1="4" x2="4" y2="18" stroke="white" strokeWidth="1.8" strokeLinecap="round"
            style={{ transition: "all 0.3s" }} />
        </>
      ) : (
        // Tiga garis dengan panjang berbeda — kiri-aligned, tidak simetris
        <>
          <line x1="3" y1="6"  x2="19" y2="6"  stroke="white" strokeWidth="1.8" strokeLinecap="round" />
          <line x1="3" y1="11" x2="14" y2="11" stroke="white" strokeWidth="1.8" strokeLinecap="round" />
          <line x1="3" y1="16" x2="17" y2="16" stroke="white" strokeWidth="1.8" strokeLinecap="round" />
        </>
      )}
    </svg>
  );
}

// ── Mobile Drawer ─────────────────────────────────────────────────────────────
function MobileDrawer({
  open,
  user,
  pathname,
  navItems,
  onClose,
  onSignOut,
}: {
  open: boolean;
  user: User | null;
  pathname: string;
  navItems: { label: string; href: string }[];
  onClose: () => void;
  onSignOut: () => void;
}) {
  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        className={`fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity duration-300 lg:hidden ${
          open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      />

      {/* Drawer panel — slide dari kanan */}
      <div
        className={`fixed top-0 right-0 z-50 h-full w-72 bg-[#0a0c12] border-l border-white/[0.07] flex flex-col transition-transform duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] lg:hidden ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header drawer */}
        <div className="flex items-center justify-between px-6 h-16 border-b border-white/[0.07]">
          <span className="font-black text-base tracking-widest uppercase text-white">
            Rulif<span className="text-red-500">Taskify</span>
          </span>
          <button onClick={onClose} className="text-white/40 hover:text-white transition-colors">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <line x1="3" y1="3" x2="15" y2="15" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              <line x1="15" y1="3" x2="3"  y2="15" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {/* Nav links */}
        <nav className="flex flex-col px-4 pt-4 gap-1">
          {navItems.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              onClick={onClose}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold tracking-wider transition-colors ${
                pathname === item.href
                  ? "bg-white/[0.07] text-white"
                  : "text-white/40 hover:text-white hover:bg-white/[0.04]"
              }`}
            >
              {/* Active dot */}
              <span className={`w-1.5 h-1.5 rounded-full shrink-0 transition-colors ${
                pathname === item.href ? "bg-red-500" : "bg-white/10"
              }`} />
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Divider */}
        <div className="mx-6 my-4 h-px bg-white/[0.06]" />

        {/* User section */}
        {user ? (
          <div className="px-4 flex flex-col gap-1">
            {/* User info */}
            <div className="flex items-center gap-3 px-4 py-3">
              {user.photoURL ? (
                <img src={user.photoURL} alt="" className="w-9 h-9 rounded-full object-cover border-2 border-white/20" />
              ) : (
                <div className="w-9 h-9 rounded-full bg-red-600 flex items-center justify-center border-2 border-red-500/40">
                  <span className="text-[11px] font-black text-white">
                    {user.displayName
                      ? user.displayName.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
                      : user.email?.[0].toUpperCase()}
                  </span>
                </div>
              )}
              <div className="min-w-0">
                <p className="text-xs font-bold text-white truncate">{user.displayName ?? "User"}</p>
                <p className="text-[11px] text-white/40 truncate">{user.email}</p>
              </div>
            </div>

            <Link href="/profile" onClick={onClose} className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs text-white/60 hover:text-white hover:bg-white/[0.04] transition-colors">
              <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 16 16" fill="none">
                <circle cx="8" cy="5" r="3" stroke="currentColor" strokeWidth="1.5"/>
                <path d="M2 13c0-3 2.686-5 6-5s6 2 6 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
              My Profile
            </Link>
            <Link href="/watchlist" onClick={onClose} className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs text-white/60 hover:text-white hover:bg-white/[0.04] transition-colors">
              <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 16 16" fill="none">
                <path d="M4 2h8a1 1 0 011 1v10.5l-5-3-5 3V3a1 1 0 011-1z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
              </svg>
              Watchlist
            </Link>
            <Link href="/settings" onClick={onClose} className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs text-white/60 hover:text-white hover:bg-white/[0.04] transition-colors">
              <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 16 16" fill="none">
                <circle cx="8" cy="8" r="2.5" stroke="currentColor" strokeWidth="1.5"/>
                <path d="M8 1v1.5M8 13.5V15M1 8h1.5M13.5 8H15M2.93 2.93l1.06 1.06M12.01 12.01l1.06 1.06M2.93 13.07l1.06-1.06M12.01 3.99l1.06-1.06" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
              Settings
            </Link>

            <div className="mx-2 my-2 h-px bg-white/[0.06]" />

            <button onClick={onSignOut} className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs text-red-400 hover:text-red-300 hover:bg-red-500/[0.06] transition-colors">
              <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 16 16" fill="none">
                <path d="M6 2H3a1 1 0 00-1 1v10a1 1 0 001 1h3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                <path d="M10.5 11L14 8l-3.5-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M14 8H6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
              Sign Out
            </button>
          </div>
        ) : (
          <div className="px-6 flex flex-col gap-3">
            <Link href="/auth" onClick={onClose}
              className="text-center text-xs font-semibold tracking-wider px-4 py-3 border border-white/20 hover:border-white/40 hover:text-white transition-colors rounded-xl text-white/80">
              Sign In
            </Link>
            <Link href="/auth" onClick={onClose}
              className="text-center text-xs font-semibold tracking-wider px-4 py-3 bg-red-600 hover:bg-red-500 transition-colors rounded-xl text-white">
              Sign Up
            </Link>
          </div>
        )}

        {/* Footer */}
        <div className="mt-auto px-6 pb-8">
          <p className="text-[10px] text-white/20">&copy; {new Date().getFullYear()} RulifTaskify</p>
        </div>
      </div>
    </>
  );
}

// ── Main Header ───────────────────────────────────────────────────────────────
export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const navItems = [
    { label: "Home", href: "/" },
    { label: "Movies", href: "/movies" },
    { label: "Series", href: "/series" },
    { label: "Upcoming", href: "/upcoming" },
  ];

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => setUser(u));
    return () => unsub();
  }, []);

  // Tutup dropdown kalau klik di luar
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    if (dropdownOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [dropdownOpen]);

  // Lock scroll saat drawer mobile terbuka
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  async function handleSignOut() {
    await signOut(auth);
    setDropdownOpen(false);
    setMobileOpen(false);
    router.push("/");
  }

  return (
    <>
      <header className="sticky top-0 z-50 grid grid-cols-3 items-center px-6 lg:px-10 h-16 bg-[#080a0f]/80 backdrop-blur-md border-b border-white/[0.07]">

        {/* ── Kiri: nav desktop / hamburger mobile ── */}
        <div className="flex items-center">
          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center gap-7">
            {navItems.map((item) => (
              <Link key={item.label} href={item.href}
                className={`text-xs font-semibold tracking-wider transition-colors ${
                  pathname === item.href ? "text-white" : "text-white/40 hover:text-white"
                }`}>
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Mobile hamburger — unik */}
          <button
            onClick={() => setMobileOpen(true)}
            className="lg:hidden w-9 h-9 flex items-center justify-center rounded-lg hover:bg-white/[0.06] transition-colors"
            aria-label="Open menu"
          >
            <MenuIcon open={false} />
          </button>
        </div>

        {/* ── Tengah: logo ── */}
        <div className="flex justify-center">
          <Link href="/" className="font-black text-xl tracking-widest uppercase text-white">
            Rulif<span className="text-red-500">Taskify</span>
          </Link>
        </div>

        {/* ── Kanan: auth ── */}
        <div className="flex justify-end items-center gap-3">
          {user ? (
            <div className="relative" ref={dropdownRef}>
              <Avatar user={user} onClick={() => setDropdownOpen((v) => !v)} />
              {dropdownOpen && (
                <DropdownMenu user={user} onClose={() => setDropdownOpen(false)} onSignOut={handleSignOut} />
              )}
            </div>
          ) : (
            <>
              <Link href="/auth"
                className="hidden sm:inline-flex text-xs font-semibold tracking-wider px-4 py-2 border border-white/20 hover:border-white/40 hover:text-white transition-colors rounded-lg text-white/80">
                Sign In
              </Link>
              <Link href="/auth"
                className="text-xs font-semibold tracking-wider px-4 py-2 bg-red-600 hover:bg-red-500 transition-colors rounded-lg text-white">
                Sign Up
              </Link>
            </>
          )}
        </div>
      </header>

      {/* Mobile Drawer */}
      <MobileDrawer
        open={mobileOpen}
        user={user}
        pathname={pathname}
        navItems={navItems}
        onClose={() => setMobileOpen(false)}
        onSignOut={handleSignOut}
      />
    </>
  );
}