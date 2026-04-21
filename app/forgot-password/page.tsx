// app/forgot-password/page.tsx
"use client";

import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

const TMDB_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY || "";
const IMG_BASE = "https://image.tmdb.org/t/p/w342";

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

function ErrorBox({ message }: { message: string }) {
  if (!message) return null;
  return (
    <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-2.5 text-xs text-red-400">
      {message}
    </div>
  );
}

function parseFirebaseError(code: string): string {
  switch (code) {
    case "auth/user-not-found": return "Email tidak terdaftar. Periksa kembali alamat email kamu.";
    case "auth/invalid-email": return "Format email tidak valid.";
    case "auth/too-many-requests": return "Terlalu banyak percobaan. Coba lagi beberapa menit.";
    case "auth/network-request-failed": return "Gagal terhubung. Periksa koneksi internet kamu.";
    case "auth/weak-password": return "Password terlalu lemah. Minimal 6 karakter.";
    case "auth/expired-action-code": return "Link sudah kadaluarsa. Minta reset ulang.";
    case "auth/invalid-action-code": return "Link tidak valid. Minta reset ulang.";
    default: return "Terjadi kesalahan. Silakan coba lagi.";
  }
}

function OtpInput({ value, onChange, disabled }: { value: string; onChange: (v: string) => void; disabled?: boolean }) {
  const inputs = useRef<(HTMLInputElement | null)[]>([]);
  function handleChange(i: number, e: React.ChangeEvent<HTMLInputElement>) {
    const char = e.target.value.replace(/\D/g, "").slice(-1);
    const arr = value.padEnd(6, " ").split("");
    arr[i] = char || " ";
    const next = arr.join("").trimEnd();
    onChange(next);
    if (char && i < 5) inputs.current[i + 1]?.focus();
  }
  function handleKey(i: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Backspace") {
      const arr = value.padEnd(6, " ").split("");
      if (!arr[i]?.trim() && i > 0) {
        arr[i - 1] = " ";
        onChange(arr.join("").trimEnd());
        inputs.current[i - 1]?.focus();
      } else {
        arr[i] = " ";
        onChange(arr.join("").trimEnd());
      }
    }
  }
  function handlePaste(e: React.ClipboardEvent) {
    const paste = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (paste.length === 6) { onChange(paste); inputs.current[5]?.focus(); }
    e.preventDefault();
  }
  return (
    <div className="flex gap-2 justify-between">
      {Array.from({ length: 6 }).map((_, i) => (
        <input key={i} ref={(el) => { inputs.current[i] = el; }}
          type="text" inputMode="numeric" maxLength={1}
          value={value[i]?.trim() || ""}
          onChange={(e) => handleChange(i, e)}
          onKeyDown={(e) => handleKey(i, e)}
          onPaste={handlePaste} disabled={disabled}
          className="w-12 h-13 text-center text-xl font-black text-white bg-white/[0.05] border border-white/[0.08] rounded-xl focus:outline-none focus:border-red-500/50 focus:bg-white/[0.07] disabled:opacity-40 transition-all py-3"
        />
      ))}
    </div>
  );
}

function Countdown({ duration, onExpire, resetKey }: { duration: number; onExpire: () => void; resetKey: number }) {
  const [left, setLeft] = useState(duration);
  useEffect(() => {
    setLeft(duration);
    const id = setInterval(() => {
      setLeft((p) => { if (p <= 1) { clearInterval(id); onExpire(); return 0; } return p - 1; });
    }, 1000);
    return () => clearInterval(id);
  }, [resetKey]);
  const m = Math.floor(left / 60).toString().padStart(2, "0");
  const s = (left % 60).toString().padStart(2, "0");
  return (
    <span className={`font-mono text-xs font-bold tabular-nums ${left < 60 ? "text-red-400" : "text-white/40"}`}>
      {m}:{s}
    </span>
  );
}

// ── 4 dots sekarang ───────────────────────────────────────────────────────────
function StepDots({ current }: { current: number }) {
  return (
    <div className="flex items-center gap-2 mb-8">
      {[0, 1, 2, 3].map((i) => (
        <div key={i} className={`rounded-full transition-all duration-300 ${i === current ? "w-5 h-1.5 bg-red-500" :
          i < current ? "w-1.5 h-1.5 bg-white/30" :
            "w-1.5 h-1.5 bg-white/10"
          }`} />
      ))}
    </div>
  );
}

const variants = {
  enter: (dir: number) => ({ x: dir > 0 ? "100%" : "-100%", opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: dir > 0 ? "-100%" : "100%", opacity: 0 }),
};

// ── Step type tambah "newpass" & "done" ───────────────────────────────────────
type Step = "email" | "otp" | "newpass" | "done";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("email");
  const [dir, setDir] = useState(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [serverOtp, setServerOtp] = useState("");
  const [otpExpired, setOtpExpired] = useState(false);
  const [resendKey, setResendKey] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [newPass, setNewPass] = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [oobCode, setOobCode] = useState(""); // Firebase action code

  const Spinner = () => (
    <svg className="w-3.5 h-3.5 animate-spin" viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
    </svg>
  );

  // ── Kirim OTP ─────────────────────────────────────────────────────────────
  async function sendOtp() {
    setError(""); setLoading(true);
    try {
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      setServerOtp(code); setOtpExpired(false); setOtp("");
      const emailjs = (await import("@emailjs/browser")).default;
      await emailjs.send(
        "service_aiwh8w2",
        "template_dgwwepq",
        { email, passcode: code },
        "xdoj3X8-k8h62Ux_H"
      );
      setDir(1); setStep("otp"); setResendKey((k) => k + 1);
    } catch {
      setError("Gagal mengirim kode. Periksa koneksi kamu.");
    } finally {
      setLoading(false);
    }
  }

  // ── Verify OTP → ke step newpass ──────────────────────────────────────────
  function verifyOtp() {
    setError("");
    if (otpExpired) return setError("Kode sudah kadaluarsa. Minta kode baru.");
    if (otp.length < 6) return setError("Masukkan 6 digit kode OTP.");
    if (otp !== serverOtp) return setError("Kode OTP salah. Silakan periksa email kamu.");
    setDir(1);
    setStep("newpass");
  }

  // ── Reset password langsung via Firebase ──────────────────────────────────
  async function handleResetPassword() {
    setError("");
    if (newPass.length < 6) return setError("Password minimal 6 karakter.");
    if (newPass !== confirmPass) return setError("Password tidak cocok.");
    setLoading(true);
    try {
      const res = await fetch("/api/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, newPassword: newPass }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setDir(1);
      setStep("done");
    } catch (err: any) {
      setError(err.message || "Gagal menyimpan password.");
    } finally {
      setLoading(false);
    }
  }

  function goBack() {
    setError(""); setDir(-1); setStep("email");
  }

  const EyeIcon = ({ open }: { open: boolean }) => (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      {open
        ? <><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></>
        : <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
      }
    </svg>
  );

  return (
    <div className="min-h-screen flex bg-[#080a0f]">

      {/* Poster Collage */}
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

      {/* Form Panel */}
      <div className="relative z-10 flex flex-col justify-between w-full lg:w-[40%] max-w-[480px] mx-auto lg:mx-0 lg:max-w-none px-6 sm:px-10 lg:px-16 py-8 bg-[#080a0f] overflow-hidden">
        <Link href="/" className="font-black text-xl tracking-widest uppercase text-white">
          Rulif<span className="text-red-500">Taskify</span>
        </Link>

        <div className="flex-1 relative">
          <AnimatePresence mode="wait" custom={dir}>
            <motion.div key={step} custom={dir} variants={variants}
              initial="enter" animate="center" exit="exit"
              transition={{ duration: 0.38, ease: [0.4, 0, 0.2, 1] }}
              className="absolute inset-0 flex flex-col justify-center py-8"
            >

              {/* STEP 1: Email */}
              {step === "email" && (
                <div className="flex flex-col gap-5">
                  <StepDots current={0} />
                  <div>
                    <h1 className="text-3xl font-black text-white mb-1 tracking-tight">Lupa password?</h1>
                    <p className="text-white/40 text-xs leading-relaxed">
                      Masukkan email kamu dan kami kirimkan kode OTP 6 digit.{" "}
                      <Link href="/auth" className="text-red-500 hover:text-red-400 font-semibold transition-colors">Kembali login</Link>
                    </p>
                  </div>
                  <ErrorBox message={error} />
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold tracking-widest text-white/40 uppercase">Email Address</label>
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && email && sendOtp()}
                      placeholder="you@example.com"
                      className="bg-white/[0.05] border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/20 focus:outline-none focus:border-red-500/50 focus:bg-white/[0.07] transition-all"
                    />
                  </div>
                  <button onClick={sendOtp} disabled={loading || !email}
                    className="w-full bg-red-600 hover:bg-red-500 disabled:opacity-60 disabled:cursor-not-allowed active:scale-[0.98] transition-all rounded-xl py-3 text-xs font-black tracking-widest text-white uppercase flex items-center justify-center gap-2">
                    {loading && <Spinner />}{loading ? "Mengirim..." : "Kirim Kode OTP"}
                  </button>
                </div>
              )}

              {/* STEP 2: OTP */}
              {step === "otp" && (
                <div className="flex flex-col gap-5">
                  <StepDots current={1} />
                  <div>
                    <h1 className="text-3xl font-black text-white mb-1 tracking-tight">Cek email kamu</h1>
                    <p className="text-white/40 text-xs leading-relaxed">
                      Kode 6 digit dikirim ke <span className="text-white/70 font-semibold">{email}</span>
                    </p>
                  </div>
                  <ErrorBox message={error} />
                  <OtpInput value={otp} onChange={setOtp} disabled={otpExpired} />
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-white/30 flex items-center gap-1.5">
                      {otpExpired
                        ? <span className="text-red-400">Kode kadaluarsa</span>
                        : <>Berlaku: <Countdown duration={300} onExpire={() => setOtpExpired(true)} resetKey={resendKey} /></>
                      }
                    </span>
                    <button onClick={() => { setError(""); sendOtp(); }} disabled={loading}
                      className="text-[11px] text-red-500 hover:text-red-400 font-semibold transition-colors disabled:opacity-50">
                      Kirim ulang
                    </button>
                  </div>
                  <button onClick={verifyOtp} disabled={loading || otp.replace(/\s/g, "").length < 6}
                    className="w-full bg-red-600 hover:bg-red-500 disabled:opacity-60 disabled:cursor-not-allowed active:scale-[0.98] transition-all rounded-xl py-3 text-xs font-black tracking-widest text-white uppercase flex items-center justify-center gap-2">
                    {loading && <Spinner />}{loading ? "Memverifikasi..." : "Verifikasi Kode"}
                  </button>
                  <button onClick={goBack} className="text-center text-[11px] text-white/30 hover:text-white/50 transition-colors">
                    ← Ubah email
                  </button>
                </div>
              )}

              {/* STEP 3: New Password */}
              {step === "newpass" && (
                <div className="flex flex-col gap-5">
                  <StepDots current={2} />
                  <div>
                    <h1 className="text-3xl font-black text-white mb-1 tracking-tight">Buat password baru</h1>
                    <p className="text-white/40 text-xs leading-relaxed">
                      Minimal 6 karakter. Gunakan kombinasi huruf dan angka.
                    </p>
                  </div>
                  <ErrorBox message={error} />

                  {/* New Password */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold tracking-widest text-white/40 uppercase">New Password</label>
                    <div className="relative">
                      <input
                        type={showNew ? "text" : "password"}
                        value={newPass}
                        onChange={(e) => setNewPass(e.target.value)}
                        placeholder="••••••••"
                        className="w-full bg-white/[0.05] border border-white/[0.08] rounded-xl px-4 py-2.5 pr-10 text-sm text-white placeholder-white/20 focus:outline-none focus:border-red-500/50 focus:bg-white/[0.07] transition-all"
                      />
                      <button type="button" onClick={() => setShowNew(!showNew)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors">
                        <EyeIcon open={showNew} />
                      </button>
                    </div>
                  </div>

                  {/* Confirm Password */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold tracking-widest text-white/40 uppercase">Confirm Password</label>
                    <div className="relative">
                      <input
                        type={showConfirm ? "text" : "password"}
                        value={confirmPass}
                        onChange={(e) => setConfirmPass(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleResetPassword()}
                        placeholder="••••••••"
                        className="w-full bg-white/[0.05] border border-white/[0.08] rounded-xl px-4 py-2.5 pr-10 text-sm text-white placeholder-white/20 focus:outline-none focus:border-red-500/50 focus:bg-white/[0.07] transition-all"
                      />
                      <button type="button" onClick={() => setShowConfirm(!showConfirm)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors">
                        <EyeIcon open={showConfirm} />
                      </button>
                    </div>
                  </div>

                  {/* Password strength indicator */}
                  {newPass.length > 0 && (
                    <div className="flex gap-1">
                      {[1, 2, 3, 4].map((i) => (
                        <div key={i} className={`h-1 flex-1 rounded-full transition-all duration-300 ${newPass.length >= i * 3
                          ? i <= 1 ? "bg-red-500"
                            : i <= 2 ? "bg-orange-500"
                              : i <= 3 ? "bg-yellow-500"
                                : "bg-green-500"
                          : "bg-white/10"
                          }`} />
                      ))}
                    </div>
                  )}

                  <button onClick={handleResetPassword} disabled={loading || !newPass || !confirmPass}
                    className="w-full bg-red-600 hover:bg-red-500 disabled:opacity-60 disabled:cursor-not-allowed active:scale-[0.98] transition-all rounded-xl py-3 text-xs font-black tracking-widest text-white uppercase flex items-center justify-center gap-2">
                    {loading && <Spinner />}{loading ? "Menyimpan..." : "Simpan Password"}
                  </button>
                </div>
              )}

              {/* STEP 4: Done */}
              {step === "done" && (
                <div className="flex flex-col gap-6">
                  <StepDots current={3} />
                  <div>
                    <h1 className="text-3xl font-black text-white mb-1 tracking-tight">Password tersimpan!</h1>
                    <p className="text-white/40 text-xs leading-relaxed">
                      Password kamu berhasil diperbarui.{" "}
                      Silakan login dengan password baru.
                    </p>
                  </div>
                  <div className="w-14 h-14 rounded-2xl bg-green-500/10 border border-green-500/20 flex items-center justify-center">
                    <svg className="w-6 h-6 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <button onClick={() => router.push("/auth")}
                    className="w-full bg-red-600 hover:bg-red-500 active:scale-[0.98] transition-all rounded-xl py-3 text-xs font-black tracking-widest text-white uppercase">
                    Kembali ke Login
                  </button>
                  <button onClick={() => { setDir(-1); setStep("email"); setOtp(""); setNewPass(""); setConfirmPass(""); setError(""); }}
                    className="text-center text-[11px] text-white/30 hover:text-white/50 transition-colors">
                    Kirim ulang ke email lain
                  </button>
                </div>
              )}

            </motion.div>
          </AnimatePresence>
        </div>

        <p className="text-[10px] text-white/20">&copy; {new Date().getFullYear()} RulifTaskify. All rights reserved.</p>
      </div>
    </div>
  );
}