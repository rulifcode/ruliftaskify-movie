"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { onAuthStateChanged, signOut, User } from "firebase/auth";
import { auth } from "@/lib/firebase";

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

const NAV_ICONS: Record<string, React.ReactNode> = {
  Home: (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z"/><path d="M9 21V12h6v9"/>
    </svg>
  ),
  Movies: (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="4" width="20" height="16" rx="2"/><path d="M7 4v16M17 4v16M2 9h5M17 9h5M2 15h5M17 15h5"/>
    </svg>
  ),
  Series: (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/>
    </svg>
  ),
  Upcoming: (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 3"/>
    </svg>
  ),
};

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
        className={`fixed inset-0 z-40 bg-black/70 backdrop-blur-sm transition-opacity duration-300 lg:hidden ${
          open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      />

      {/* Drawer */}
      <div
        className={`fixed top-0 right-0 z-50 h-full w-[280px] flex flex-col transition-transform duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] lg:hidden ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
        style={{ background: "linear-gradient(160deg, #0f1118 0%, #090b10 100%)" }}
      >
        {/* Subtle top accent */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-red-500/40 to-transparent" />

        {/* Header — Brand + Close */}
        <div className="flex items-center justify-between px-5 h-16 border-b border-white/[0.06]">
          <Link href="/" onClick={onClose} className="font-black text-base tracking-widest uppercase text-white">
            Rulif<span className="text-red-500">Taskify</span>
          </Link>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-white/50 hover:text-white transition-all"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <line x1="1" y1="1" x2="13" y2="13" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              <line x1="13" y1="1" x2="1"  y2="13" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {/* Nav */}
        <nav className="flex flex-col px-3 pt-5 gap-1">
          <p className="text-[10px] font-bold tracking-[.15em] uppercase text-white/25 px-3 mb-2">Menu</p>
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.label}
                href={item.href}
                onClick={onClose}
                className={`flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-semibold tracking-wide transition-all ${
                  isActive
                    ? "bg-red-600/15 text-white border border-red-500/20"
                    : "text-white/45 hover:text-white hover:bg-white/[0.05] border border-transparent"
                }`}
              >
                <span className={`transition-colors ${isActive ? "text-red-400" : "text-white/30"}`}>
                  {NAV_ICONS[item.label]}
                </span>
                {item.label}
                {isActive && (
                  <span className="ml-auto w-1.5 h-1.5 rounded-full bg-red-500" />
                )}
              </Link>
            );
          })}
        </nav>

        <div className="mx-5 my-5 h-px bg-white/[0.06]" />

        {/* User section */}
        {user ? (
          <div className="px-3 flex flex-col gap-1">
            <p className="text-[10px] font-bold tracking-[.15em] uppercase text-white/25 px-3 mb-2">Account</p>

            {/* User info card */}
            <div className="flex items-center gap-3 px-3 py-3 rounded-xl bg-white/[0.03] border border-white/[0.06] mb-1">
              {user.photoURL ? (
                <img src={user.photoURL} alt="" className="w-9 h-9 rounded-full object-cover border-2 border-white/20 shrink-0" />
              ) : (
                <div className="w-9 h-9 rounded-full bg-red-600 flex items-center justify-center border-2 border-red-500/40 shrink-0">
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

            <Link href="/profile" onClick={onClose} className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs text-white/55 hover:text-white hover:bg-white/[0.05] transition-colors">
              <svg className="w-4 h-4 shrink-0 text-white/30" viewBox="0 0 16 16" fill="none">
                <circle cx="8" cy="5" r="3" stroke="currentColor" strokeWidth="1.5"/>
                <path d="M2 13c0-3 2.686-5 6-5s6 2 6 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
              My Profile
            </Link>
            <Link href="/watchlist" onClick={onClose} className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs text-white/55 hover:text-white hover:bg-white/[0.05] transition-colors">
              <svg className="w-4 h-4 shrink-0 text-white/30" viewBox="0 0 16 16" fill="none">
                <path d="M4 2h8a1 1 0 011 1v10.5l-5-3-5 3V3a1 1 0 011-1z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
              </svg>
              Watchlist
            </Link>
            <Link href="/settings" onClick={onClose} className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs text-white/55 hover:text-white hover:bg-white/[0.05] transition-colors">
              <svg className="w-4 h-4 shrink-0 text-white/30" viewBox="0 0 16 16" fill="none">
                <circle cx="8" cy="8" r="2.5" stroke="currentColor" strokeWidth="1.5"/>
                <path d="M8 1v1.5M8 13.5V15M1 8h1.5M13.5 8H15M2.93 2.93l1.06 1.06M12.01 12.01l1.06 1.06M2.93 13.07l1.06-1.06M12.01 3.99l1.06-1.06" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
              Settings
            </Link>

            <div className="mx-2 my-2 h-px bg-white/[0.06]" />

            <button onClick={onSignOut} className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs text-red-400 hover:text-red-300 hover:bg-red-500/[0.06] transition-colors">
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 16 16" fill="none">
                <path d="M6 2H3a1 1 0 00-1 1v10a1 1 0 001 1h3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                <path d="M10.5 11L14 8l-3.5-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M14 8H6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
              Sign Out
            </button>
          </div>
        ) : (
          /* ── UNAUTHENTICATED: Brand + Auth Buttons inside drawer ── */
          <div className="px-3 flex flex-col gap-2.5">
            <p className="text-[10px] font-bold tracking-[.15em] uppercase text-white/25 px-3 mb-1">Account</p>
            <Link href="/auth" onClick={onClose}
              className="text-center text-xs font-semibold tracking-wider px-4 py-3 border border-white/15 hover:border-white/30 hover:text-white transition-colors rounded-xl text-white/70">
              Sign In
            </Link>
            <Link href="/auth" onClick={onClose}
              className="text-center text-xs font-semibold tracking-wider px-4 py-3 bg-red-600 hover:bg-red-500 transition-colors rounded-xl text-white">
              Sign Up
            </Link>
          </div>
        )}

        {/* Footer */}
        <div className="mt-auto px-5 pb-8 pt-4 border-t border-white/[0.05]">
          <p className="text-[10px] text-white/20">&copy; {new Date().getFullYear()} RulifTaskify</p>
        </div>
      </div>
    </>
  );
}

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
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => setUser(u));
    return () => unsub();
  }, []);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    if (dropdownOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [dropdownOpen]);

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

        {/* LEFT — hamburger (mobile) | nav links (desktop) */}
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

          {/* Mobile: hamburger only */}
          <button
            onClick={() => setMobileOpen(true)}
            className="lg:hidden w-9 h-9 flex items-center justify-center rounded-lg hover:bg-white/[0.06] transition-colors"
            aria-label="Open menu"
          >
            {/* Hamburger icon */}
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
              <line x1="3" y1="6"  x2="19" y2="6"  stroke="white" strokeWidth="1.8" strokeLinecap="round" />
              <line x1="3" y1="11" x2="14" y2="11" stroke="white" strokeWidth="1.8" strokeLinecap="round" />
              <line x1="3" y1="16" x2="17" y2="16" stroke="white" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {/* CENTER — Brand (always visible on desktop; hidden on mobile — shown in drawer) */}
        <div className="flex justify-center">
          <Link href="/" className="font-black text-xl tracking-widest uppercase text-white">
            {/* Show brand on all viewports via header center */}
            <span className="hidden lg:inline">Rulif<span className="text-red-500">Taskify</span></span>
            {/* On mobile, brand is inside the drawer — show a compact icon/wordmark */}
            <span className="lg:hidden font-black text-base tracking-widest uppercase">
              Rulif<span className="text-red-500">Taskify</span>
            </span>
          </Link>
        </div>

        {/* RIGHT — avatar (logged in) | auth buttons (logged out, desktop only) */}
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
              {/* Desktop: show both Sign In + Sign Up */}
              <Link href="/auth"
                className="hidden lg:inline-flex text-xs font-semibold tracking-wider px-4 py-2 border border-white/20 hover:border-white/40 hover:text-white transition-colors rounded-lg text-white/80">
                Sign In
              </Link>
              <Link href="/auth"
                className="hidden lg:inline-flex text-xs font-semibold tracking-wider px-4 py-2 bg-red-600 hover:bg-red-500 transition-colors rounded-lg text-white">
                Sign Up
              </Link>
              {/* Mobile: nothing here — Sign In/Up are in the drawer */}
            </>
          )}
        </div>
      </header>

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