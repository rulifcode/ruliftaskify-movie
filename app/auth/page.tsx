"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  updateProfile,
} from "firebase/auth";
import { auth, provider } from "@/lib/firebase";

const TMDB_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY || "";
const IMG_BASE = "https://image.tmdb.org/t/p/w342";

// ── Poster Collage ────────────────────────────────────────────────────────────
function PosterCollage() {
  const [columns, setColumns] = useState<string[][]>([[], [], [], []]);

  useEffect(() => {
    async function fetchPosters() {
      try {
        const [r1, r2, r3] = await Promise.all([
          fetch(`https://api.themoviedb.org/3/movie/popular?api_key=${TMDB_KEY}&page=1`).then((r) => r.json()),
          fetch(`https://api.themoviedb.org/3/movie/popular?api_key=${TMDB_KEY}&page=2`).then((r) => r.json()),
          fetch(`https://api.themoviedb.org/3/trending/movie/week?api_key=${TMDB_KEY}`).then((r) => r.json()),
        ]);
        const posters: string[] = [...r1.results, ...r2.results, ...r3.results]
          .filter((m: any) => m.poster_path)
          .map((m: any) => IMG_BASE + m.poster_path);
        const cols: string[][] = [[], [], [], []];
        for (let c = 0; c < 4; c++) {
          const slice = posters.slice(c * 10, c * 10 + 10);
          cols[c] = [...slice, ...slice];
        }
        setColumns(cols);
      } catch (err) {
        console.error("TMDB fetch failed:", err);
      }
    }
    fetchPosters();
  }, []);

  return (
    <>
      <style>{`
        @keyframes scrollUp   { from { transform: translateY(0);    } to { transform: translateY(-50%); } }
        @keyframes scrollDown { from { transform: translateY(-50%); } to { transform: translateY(0);    } }
        .scroll-up   { animation: scrollUp   28s linear infinite; }
        .scroll-down { animation: scrollDown 32s linear infinite; }
      `}</style>
      <div className="absolute inset-0 grid grid-cols-4 gap-1 p-1 scale-[1.04]">
        {columns.map((col, ci) => (
          <div key={ci} className={`flex flex-col gap-1 ${ci % 2 === 0 ? "scroll-up" : "scroll-down"}`}>
            {col.map((src, i) => (
              <img key={i} src={src} alt="" loading="lazy"
                className="w-full aspect-[2/3] rounded-md object-cover bg-[#1a1a2e]" />
            ))}
          </div>
        ))}
      </div>
    </>
  );
}

// ── Google Button ─────────────────────────────────────────────────────────────
function GoogleButton({ onClick, loading }: { onClick: () => void; loading: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={loading}
      className="w-full border border-white/[0.08] hover:border-white/20 hover:bg-white/[0.04] disabled:opacity-50 disabled:cursor-not-allowed transition-all rounded-xl py-2.5 text-xs font-semibold text-white/50 hover:text-white/80 flex items-center justify-center gap-2"
    >
      <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
      </svg>
      {loading ? "Menghubungkan..." : "Continue with Google"}
    </button>
  );
}

// ── Or Divider ────────────────────────────────────────────────────────────────
function OrDivider() {
  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 h-px bg-white/[0.06]" />
      <span className="text-[10px] text-white/20 font-bold tracking-widest">OR</span>
      <div className="flex-1 h-px bg-white/[0.06]" />
    </div>
  );
}

// ── Error Message ─────────────────────────────────────────────────────────────
function ErrorBox({ message }: { message: string }) {
  if (!message) return null;
  return (
    <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-2.5 text-xs text-red-400">
      {message}
    </div>
  );
}

// ── Firebase error → pesan ramah ─────────────────────────────────────────────
function parseFirebaseError(code: string): string {
  switch (code) {
    case "auth/user-not-found":
    case "auth/wrong-password":
    case "auth/invalid-credential":
      return "Email atau password salah. Silakan coba lagi.";
    case "auth/email-already-in-use":
      return "Email ini sudah terdaftar. Silakan login.";
    case "auth/weak-password":
      return "Password terlalu lemah. Minimal 6 karakter.";
    case "auth/invalid-email":
      return "Format email tidak valid.";
    case "auth/popup-closed-by-user":
      return "Login dibatalkan.";
    case "auth/too-many-requests":
      return "Terlalu banyak percobaan. Coba lagi nanti.";
    case "auth/network-request-failed":
      return "Gagal terhubung. Periksa koneksi internet kamu.";
    default:
      return "Terjadi kesalahan. Silakan coba lagi.";
  }
}

// ── Login Form ────────────────────────────────────────────────────────────────
function LoginForm({ onSwitch }: { onSwitch: () => void }) {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push("/"); // → homepage
    } catch (err: any) {
      setError(parseFirebaseError(err.code));
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogle() {
    setError("");
    setGoogleLoading(true);
    try {
      await signInWithPopup(auth, provider);
      router.push("/"); // → homepage
    } catch (err: any) {
      setError(parseFirebaseError(err.code));
    } finally {
      setGoogleLoading(false);
    }
  }

  return (
    <div className="flex-1 flex flex-col justify-center py-8">
      <h1 className="text-3xl font-black text-white mb-1 tracking-tight">Welcome back</h1>
      <p className="text-white/40 text-xs mb-6">
        Don&apos;t have an account?{" "}
        <button onClick={onSwitch} className="text-red-500 hover:text-red-400 font-semibold transition-colors">
          Sign Up Now
        </button>
      </p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <ErrorBox message={error} />

        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-bold tracking-widest text-white/40 uppercase">Email Address</label>
          <input
            type="email" value={email} onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com" required
            className="bg-white/[0.05] border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/20 focus:outline-none focus:border-red-500/50 focus:bg-white/[0.07] transition-all"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-bold tracking-widest text-white/40 uppercase">Password</label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"} value={password}
              onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required
              className="w-full bg-white/[0.05] border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/20 focus:outline-none focus:border-red-500/50 focus:bg-white/[0.07] transition-all pr-14"
            />
            <button type="button" onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 text-[10px] font-bold tracking-wider transition-colors">
              {showPassword ? "HIDE" : "SHOW"}
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 cursor-pointer group" onClick={() => setRemember(!remember)}>
            <div className={`w-3.5 h-3.5 rounded border flex items-center justify-center transition-all ${remember ? "bg-red-600 border-red-600" : "border-white/20 group-hover:border-white/40"}`}>
              {remember && (
                <svg className="w-2 h-2 text-white" fill="none" viewBox="0 0 10 10">
                  <path d="M1.5 5l2.5 2.5 4.5-4.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </div>
            <span className="text-[11px] text-white/40 group-hover:text-white/60 transition-colors">Remember Me</span>
          </label>
          <Link href="/forgot-password" className="text-[11px] text-red-500 hover:text-red-400 font-semibold transition-colors">
            Forgot Password?
          </Link>
        </div>

        <button
          type="submit" disabled={loading}
          className="mt-1 w-full bg-red-600 hover:bg-red-500 disabled:opacity-60 disabled:cursor-not-allowed active:scale-[0.98] transition-all rounded-xl py-3 text-xs font-black tracking-widest text-white uppercase flex items-center justify-center gap-2"
        >
          {loading && (
            <svg className="w-3.5 h-3.5 animate-spin" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
            </svg>
          )}
          {loading ? "Signing in..." : "Sign In"}
        </button>

        <OrDivider />
        <GoogleButton onClick={handleGoogle} loading={googleLoading} />
      </form>
    </div>
  );
}

// ── Register Form ─────────────────────────────────────────────────────────────
function RegisterForm({ onSwitch }: { onSwitch: () => void }) {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [agree, setAgree] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Password dan konfirmasi password tidak cocok.");
      return;
    }
    if (!agree) {
      setError("Kamu harus menyetujui Terms of Service terlebih dahulu.");
      return;
    }

    setLoading(true);
    try {
      const { user } = await createUserWithEmailAndPassword(auth, email, password);
      // Simpan displayName ke Firebase profile
      await updateProfile(user, { displayName: name });
      router.push("/"); // → homepage
    } catch (err: any) {
      setError(parseFirebaseError(err.code));
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogle() {
    setError("");
    setGoogleLoading(true);
    try {
      await signInWithPopup(auth, provider);
      router.push("/"); // → homepage
    } catch (err: any) {
      setError(parseFirebaseError(err.code));
    } finally {
      setGoogleLoading(false);
    }
  }

  return (
    <div className="flex-1 flex flex-col justify-center py-8">
      <h1 className="text-3xl font-black text-white mb-1 tracking-tight">Create account</h1>
      <p className="text-white/40 text-xs mb-6">
        Already have an account?{" "}
        <button onClick={onSwitch} className="text-red-500 hover:text-red-400 font-semibold transition-colors">
          Sign In
        </button>
      </p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <ErrorBox message={error} />

        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-bold tracking-widest text-white/40 uppercase">Full Name</label>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)}
            placeholder="John Doe" required
            className="bg-white/[0.05] border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/20 focus:outline-none focus:border-red-500/50 focus:bg-white/[0.07] transition-all" />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-bold tracking-widest text-white/40 uppercase">Email Address</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com" required
            className="bg-white/[0.05] border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/20 focus:outline-none focus:border-red-500/50 focus:bg-white/[0.07] transition-all" />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-bold tracking-widest text-white/40 uppercase">Password</label>
          <div className="relative">
            <input type={showPassword ? "text" : "password"} value={password}
              onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required
              className="w-full bg-white/[0.05] border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/20 focus:outline-none focus:border-red-500/50 focus:bg-white/[0.07] transition-all pr-14" />
            <button type="button" onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 text-[10px] font-bold tracking-wider transition-colors">
              {showPassword ? "HIDE" : "SHOW"}
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-bold tracking-widest text-white/40 uppercase">Confirm Password</label>
          <div className="relative">
            <input type={showConfirm ? "text" : "password"} value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)} placeholder="••••••••" required
              className="w-full bg-white/[0.05] border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/20 focus:outline-none focus:border-red-500/50 focus:bg-white/[0.07] transition-all pr-14" />
            <button type="button" onClick={() => setShowConfirm(!showConfirm)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 text-[10px] font-bold tracking-wider transition-colors">
              {showConfirm ? "HIDE" : "SHOW"}
            </button>
          </div>
        </div>

        <label className="flex items-start gap-2 cursor-pointer group" onClick={() => setAgree(!agree)}>
          <div className={`mt-0.5 w-3.5 h-3.5 shrink-0 rounded border flex items-center justify-center transition-all ${agree ? "bg-red-600 border-red-600" : "border-white/20 group-hover:border-white/40"}`}>
            {agree && (
              <svg className="w-2 h-2 text-white" fill="none" viewBox="0 0 10 10">
                <path d="M1.5 5l2.5 2.5 4.5-4.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
          </div>
          <span className="text-[11px] text-white/40 group-hover:text-white/60 transition-colors leading-relaxed">
            I agree to the{" "}
            <Link href="/terms" className="text-red-500 hover:text-red-400 font-semibold transition-colors">Terms of Service</Link>
            {" "}and{" "}
            <Link href="/privacy" className="text-red-500 hover:text-red-400 font-semibold transition-colors">Privacy Policy</Link>
          </span>
        </label>

        <button
          type="submit" disabled={loading}
          className="mt-1 w-full bg-red-600 hover:bg-red-500 disabled:opacity-60 disabled:cursor-not-allowed active:scale-[0.98] transition-all rounded-xl py-3 text-xs font-black tracking-widest text-white uppercase flex items-center justify-center gap-2"
        >
          {loading && (
            <svg className="w-3.5 h-3.5 animate-spin" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
            </svg>
          )}
          {loading ? "Creating account..." : "Create Account"}
        </button>

        <OrDivider />
        <GoogleButton onClick={handleGoogle} loading={googleLoading} />
      </form>
    </div>
  );
}

// ── Variants ──────────────────────────────────────────────────────────────────
const variants = {
  enter: (dir: number) => ({ x: dir > 0 ? "100%" : "-100%", opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: dir > 0 ? "-100%" : "100%", opacity: 0 }),
};

// ── Main AuthPage ─────────────────────────────────────────────────────────────
export default function AuthPage() {
  const [view, setView] = useState<"login" | "register">("login");
  const [dir, setDir] = useState(1);
  const isLogin = view === "login";

  function goRegister() { setDir(1); setView("register"); }
  function goLogin() { setDir(-1); setView("login"); }

  return (
    <div className="min-h-screen flex bg-[#080a0f]" style={{ justifyContent: isLogin ? "flex-start" : "flex-end" }}>

      {isLogin && (
        <div className="hidden lg:block lg:w-[60%] relative overflow-hidden">
          <PosterCollage />
          <div className="absolute inset-0 bg-gradient-to-r from-[#080a0f] via-[#080a0f]/55 to-[#080a0f]/10 pointer-events-none z-10" />
          <div className="absolute inset-0 pointer-events-none z-10"
            style={{ background: "radial-gradient(ellipse at center, transparent 30%, rgba(8,10,15,.6) 100%)" }} />
          <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-red-500/40 to-transparent z-20" />
          <div className="absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-red-500/20 to-transparent z-20" />
          <div className="absolute bottom-6 right-5 z-20 flex flex-col items-end gap-2">
            {["4K Ultra HD", "No Ads", "New Every Week"].map((b) => (
              <span key={b} className="text-[10px] text-white/45 border border-white/[0.08] rounded-full px-3 py-1 bg-[#080a0f]/60 backdrop-blur-sm">{b}</span>
            ))}
          </div>
        </div>
      )}

      <div className="relative z-10 flex flex-col justify-between w-full lg:w-[40%] max-w-[480px] mx-auto lg:mx-0 lg:max-w-none px-6 sm:px-10 lg:px-16 py-8 bg-[#080a0f] overflow-hidden">
        <Link href="/" className="font-black text-xl tracking-widest uppercase text-white">
          Rulif<span className="text-red-500">Taskify</span>
        </Link>

        <div className="flex-1 relative">
          <AnimatePresence mode="wait" custom={dir}>
            <motion.div
              key={view} custom={dir} variants={variants}
              initial="enter" animate="center" exit="exit"
              transition={{ duration: 0.38, ease: [0.4, 0, 0.2, 1] }}
              className="absolute inset-0 flex flex-col"
            >
              {view === "login"
                ? <LoginForm onSwitch={goRegister} />
                : <RegisterForm onSwitch={goLogin} />
              }
            </motion.div>
          </AnimatePresence>
        </div>

        <p className="text-[10px] text-white/20">&copy; {new Date().getFullYear()} RulifTaskify. All rights reserved.</p>
      </div>

      {!isLogin && (
        <div className="hidden lg:block lg:w-[60%] relative overflow-hidden">
          <PosterCollage />
          <div className="absolute inset-0 bg-gradient-to-l from-[#080a0f] via-[#080a0f]/55 to-[#080a0f]/10 pointer-events-none z-10" />
          <div className="absolute inset-0 pointer-events-none z-10"
            style={{ background: "radial-gradient(ellipse at center, transparent 30%, rgba(8,10,15,.6) 100%)" }} />
          <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-red-500/40 to-transparent z-20" />
          <div className="absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-red-500/20 to-transparent z-20" />
          <div className="absolute bottom-6 left-5 z-20 flex flex-col items-start gap-2">
            {["4K Ultra HD", "No Ads", "New Every Week"].map((b) => (
              <span key={b} className="text-[10px] text-white/45 border border-white/[0.08] rounded-full px-3 py-1 bg-[#080a0f]/60 backdrop-blur-sm">{b}</span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}