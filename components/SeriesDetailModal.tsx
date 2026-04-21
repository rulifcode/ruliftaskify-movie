"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Movie } from "@/types/movie";
import {
  getSeriesDetails,
  getSeasonEpisodes,
  SeriesDetails,
  Episode,
} from "@/services/seriesService";
import CommentSection from "./CommentSection";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "@/lib/firebase";
import Link from "next/link";

type Props = {
  movie: Movie | null;
  onClose: () => void;
  isLoggedIn?: boolean;
};

// ── Constants ─────────────────────────────────────────────────────────────────

const VIEW_COUNT_KEY = "seriesModalViewCount";
const MAX_FREE_VIEWS = 5;

// ── Helpers ───────────────────────────────────────────────────────────────────

function getViewCount(): number {
  try {
    return parseInt(localStorage.getItem(VIEW_COUNT_KEY) ?? "0", 10) || 0;
  } catch {
    return 0;
  }
}

function incrementViewCount(): number {
  try {
    const next = getViewCount() + 1;
    localStorage.setItem(VIEW_COUNT_KEY, String(next));
    return next;
  } catch {
    return MAX_FREE_VIEWS + 1;
  }
}

// ── Login Gate Modal ──────────────────────────────────────────────────────────

function LoginGateModal({
  open,
  onClose,
  feature,
}: {
  open: boolean;
  onClose: () => void;
  feature: "watch" | "details";
}) {
  if (!open) return null;

  const isWatch = feature === "watch";

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center"
      style={{ background: "rgba(0,0,0,0.88)", backdropFilter: "blur(10px)" }}
      onClick={onClose}
    >
      <div
        className="relative flex flex-col items-center text-center rounded-2xl overflow-hidden"
        style={{
          background: "linear-gradient(160deg, #111320 0%, #0c0e17 100%)",
          border: "1px solid rgba(255,255,255,0.08)",
          boxShadow: "0 0 60px rgba(220,38,38,0.15), 0 24px 64px rgba(0,0,0,0.7)",
          maxWidth: 360,
          width: "90%",
          padding: "2.5rem 2rem",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Red glow top */}
        <div
          className="absolute top-0 left-0 right-0 h-px"
          style={{ background: "linear-gradient(to right, transparent, rgba(239,68,68,0.6), transparent)" }}
        />

        {/* Icon */}
        <div
          className="flex items-center justify-center rounded-full mb-5"
          style={{
            width: 64,
            height: 64,
            background: "rgba(239,68,68,0.1)",
            border: "1px solid rgba(239,68,68,0.2)",
          }}
        >
          {isWatch ? (
            <svg width="28" height="28" fill="none" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="9" stroke="rgba(239,68,68,0.9)" strokeWidth="1.8" />
              <path d="M10 8.5l5 3.5-5 3.5V8.5z" fill="rgba(239,68,68,0.7)" />
            </svg>
          ) : (
            <svg width="28" height="28" fill="none" viewBox="0 0 24 24">
              <rect x="3" y="11" width="18" height="11" rx="2" stroke="rgba(239,68,68,0.9)" strokeWidth="1.8" />
              <path d="M7 11V7a5 5 0 0110 0v4" stroke="rgba(239,68,68,0.9)" strokeWidth="1.8" strokeLinecap="round" />
              <circle cx="12" cy="16" r="1.5" fill="rgba(239,68,68,0.9)" />
            </svg>
          )}
        </div>

        <h2 className="font-black text-white text-xl tracking-tight mb-2">
          {isWatch ? "Login to Watch" : "Login Required"}
        </h2>
        <p className="text-white/45 text-xs leading-relaxed mb-6" style={{ maxWidth: 270 }}>
          {isWatch
            ? "You need an account to watch episodes. Sign in or create a free account to continue."
            : "You need an account to view full series details. Sign in or create a free account to continue."}
        </p>

        <div className="flex flex-col gap-3 w-full">
          <Link
            href="/auth"
            className="w-full flex items-center justify-center gap-2 rounded-xl font-black text-xs tracking-widest uppercase transition-all"
            style={{
              padding: "12px 0",
              background: "#dc2626",
              color: "white",
              boxShadow: "0 4px 20px rgba(220,38,38,0.35)",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "#ef4444")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "#dc2626")}
          >
            Sign In / Sign Up
          </Link>
          <button
            onClick={onClose}
            className="w-full text-xs font-semibold transition-colors"
            style={{ color: "rgba(255,255,255,0.35)", padding: "6px 0" }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.6)")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.35)")}
          >
            Maybe later
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Paywall Overlay ───────────────────────────────────────────────────────────

function LoginOverlay() {
  return (
    <div className="absolute inset-0 z-20 flex items-center justify-center rounded-2xl bg-[#0d0f15]/90 backdrop-blur-sm">
      <div className="flex flex-col items-center text-center mx-4 w-full max-w-sm px-8 py-8">

        {/* Lock icon */}
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full border border-red-500/30 bg-red-500/10">
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#f87171"
            strokeWidth={1.8}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M16.5 10.5V7a4.5 4.5 0 00-9 0v3.5M5 10.5h14a1 1 0 011 1V20a1 1 0 01-1 1H5a1 1 0 01-1-1v-8.5a1 1 0 011-1z"
            />
          </svg>
        </div>

        {/* Text */}
        <h3 className="mb-1 text-base font-bold text-white">
          Batas akses gratis tercapai
        </h3>
        <p className="mb-6 text-sm leading-relaxed text-white/45">
          Kamu telah menggunakan {MAX_FREE_VIEWS} akses gratis. Login untuk
          menjelajahi semua serial tanpa batas.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col items-center gap-3 w-full">
          <Link
            href="/auth"
            className="flex items-center justify-center gap-2 rounded-xl bg-red-600 px-10 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4M10 17l5-5-5-5M15 12H3" />
            </svg>
            Login Sekarang
          </Link>
          <p className="text-xs text-white/35">
            Belum punya akun?{" "}
            <Link href="/auth?tab=register" className="text-white/55 underline underline-offset-2 hover:text-white/80 transition-colors">
              Daftar gratis
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function SeriesDetailModal({ movie, onClose, isLoggedIn = false }: Props) {
  const router = useRouter();
  const [detail, setDetail] = useState<SeriesDetails | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [activeTab, setActiveTab] = useState<"episodes" | "about">("episodes");
  const [activeSeason, setActiveSeason] = useState(1);
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [episodesLoading, setEpisodesLoading] = useState(false);
  const [expandedEp, setExpandedEp] = useState<number | null>(null);
  const [isLocked, setIsLocked] = useState(false);

  // Auth
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [gateOpen, setGateOpen] = useState(false);
  const [gateFeature, setGateFeature] = useState<"watch" | "details">("watch");

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setAuthLoading(false);
    });
    return () => unsub();
  }, []);

  // ── On series open: check / increment view count ──────────────────────────
  // Konsisten dengan MovieDetailModal: locked skip fetch, badge pakai isLoggedIn
  useEffect(() => {
    if (!movie) {
      setDetail(null);
      setLoaded(false);
      setIsLocked(false);
      return;
    }

    if (isLoggedIn) {
      setIsLocked(false);
    } else {
      const currentCount = getViewCount();

      if (currentCount >= MAX_FREE_VIEWS) {
        // Sama seperti MovieDetailModal: langsung set locked, skip fetch
        setIsLocked(true);
        setLoaded(true);
        return;
      }

      const newCount = incrementViewCount();
      setIsLocked(newCount > MAX_FREE_VIEWS);
    }

    setLoaded(false);
    getSeriesDetails(movie.id).then((data) => {
      setDetail(data);
      const firstReal = data.seasons?.find((s) => s.season_number > 0);
      const startSeason = firstReal?.season_number ?? 1;
      setActiveSeason(startSeason);
      setTimeout(() => setLoaded(true), 50);
    });
  }, [movie, isLoggedIn]);

  useEffect(() => {
    if (!movie || !activeSeason) return;
    setEpisodesLoading(true);
    setExpandedEp(null);
    getSeasonEpisodes(movie.id, activeSeason).then((eps) => {
      setEpisodes(eps);
      setEpisodesLoading(false);
    });
  }, [movie, activeSeason]);

  const handleKey = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (gateOpen) setGateOpen(false);
        else onClose();
      }
    },
    [onClose, gateOpen]
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [handleKey]);

  if (!movie) return null;

  const backdrop = detail?.backdrop_path
    ? `https://image.tmdb.org/t/p/w1280${detail.backdrop_path}`
    : null;
  const poster = detail?.poster_path
    ? `https://image.tmdb.org/t/p/w342${detail.poster_path}`
    : null;

  const rating = detail?.vote_average ?? movie.vote_average ?? 0;
  const ratingColor =
    rating >= 7.5 ? "#34d399" : rating >= 6 ? "#facc15" : "#f87171";

  const realSeasons = (detail?.seasons ?? []).filter((s) => s.season_number > 0);

  // ── Konsisten dengan MovieDetailModal: viewsLeft pakai isLoggedIn, badge
  //    muncul saat !isLoggedIn && viewsLeft <= 3 (tanpa cek !isLocked / > 0)
  const viewsUsed = isLoggedIn ? 0 : getViewCount();
  const viewsLeft = Math.max(0, MAX_FREE_VIEWS - viewsUsed);

  function requireAuth(feature: "watch" | "details", action: () => void) {
    if (!user) {
      setGateFeature(feature);
      setGateOpen(true);
      return;
    }
    action();
  }

  const handleViewDetail = () => {
    requireAuth("details", () => {
      onClose();
      router.push(`/tv/${movie.id}`);
    });
  };

  const handleWatchEpisode = (ep: Episode, e: React.MouseEvent) => {
    e.stopPropagation();
    requireAuth("watch", () => {
      onClose();
      router.push(`/tv/${movie.id}/season/${activeSeason}/episode/${ep.episode_number}`);
    });
  };

  return (
    <>
      {/* Login Gate (for watch/details action buttons) */}
      <LoginGateModal
        open={gateOpen}
        onClose={() => setGateOpen(false)}
        feature={gateFeature}
      />

      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8"
        onClick={onClose}
        style={{ background: "rgba(0,0,0,0.85)", backdropFilter: "blur(6px)" }}
      >
        <div
          className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl"
          style={{
            background: "#0d0f15",
            border: "1px solid rgba(255,255,255,0.07)",
            opacity: loaded ? 1 : 0,
            transform: loaded ? "translateY(0)" : "translateY(16px)",
            transition: "opacity 0.35s ease, transform 0.35s ease",
            scrollbarWidth: "none",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Content wrapper — blurred + non-interactive when locked */}
          <div
            style={{
              filter: isLocked ? "blur(4px) brightness(0.45)" : "none",
              pointerEvents: isLocked ? "none" : "auto",
              userSelect: isLocked ? "none" : "auto",
              transition: "filter 0.3s ease",
            }}
          >
            {/* Hero */}
            <div className="relative w-full" style={{ aspectRatio: "16/9" }}>
              {backdrop ? (
                <img
                  src={backdrop}
                  alt={movie.title ?? movie.name}
                  className="w-full h-full object-cover rounded-t-2xl"
                />
              ) : (
                <div className="w-full h-full bg-white/5 rounded-t-2xl" />
              )}
              <div
                className="absolute inset-0 rounded-t-2xl"
                style={{ background: "linear-gradient(to top, #0d0f15 0%, transparent 60%)" }}
              />

              {/* Top-right action buttons */}
              <div className="absolute top-3 right-3 flex items-center gap-2 z-10">
                {/* Free views remaining badge — konsisten: !isLoggedIn && viewsLeft <= 3 */}
                {!isLoggedIn && viewsLeft <= 3 && (
                  <div className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border border-yellow-400/35 text-yellow-400 backdrop-blur-md bg-black/55">
                    <svg
                      className="w-3 h-3"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
                      />
                    </svg>
                    {viewsLeft} sisa
                  </div>
                )}

                {/* Close button */}
                <button
                  onClick={onClose}
                  className="w-8 h-8 rounded-full flex items-center justify-center z-10"
                  style={{
                    background: "rgba(0,0,0,0.5)",
                    backdropFilter: "blur(4px)",
                    border: "1px solid rgba(255,255,255,0.12)",
                  }}
                >
                  <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              {/* Header row */}
              <div className="flex gap-5 mb-5">
                {poster && (
                  <img
                    src={poster}
                    alt={movie.title ?? movie.name}
                    className="flex-shrink-0 rounded-xl object-cover shadow-lg"
                    style={{ width: 90, height: 135 }}
                  />
                )}
                <div className="flex-1 min-w-0">
                  <h2 className="text-white text-2xl font-bold leading-tight mb-1">
                    {detail?.name ?? movie.name ?? movie.title}
                  </h2>
                  {detail?.tagline && (
                    <p className="text-white/35 text-sm italic mb-2">"{detail.tagline}"</p>
                  )}
                  <div className="flex flex-wrap items-center gap-3 mb-3">
                    <div className="flex items-center gap-1.5">
                      <svg className="w-3.5 h-3.5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                      <span className="text-sm font-bold" style={{ color: ratingColor }}>
                        {rating.toFixed(1)}
                      </span>
                      <span className="text-white/25 text-xs">/10</span>
                    </div>
                    {detail?.first_air_date && (
                      <span className="text-white/35 text-xs">{detail.first_air_date.slice(0, 4)}</span>
                    )}
                    {detail?.number_of_seasons && (
                      <span className="text-white/35 text-xs">{detail.number_of_seasons} Seasons</span>
                    )}
                    {detail?.status && (
                      <span
                        className="text-xs px-2 py-0.5 rounded-full font-medium"
                        style={{
                          background: detail.status === "Returning Series" ? "rgba(52,211,153,0.1)" : "rgba(255,255,255,0.06)",
                          color: detail.status === "Returning Series" ? "#34d399" : "rgba(255,255,255,0.4)",
                          border: `1px solid ${detail.status === "Returning Series" ? "rgba(52,211,153,0.2)" : "rgba(255,255,255,0.08)"}`,
                        }}
                      >
                        {detail.status}
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    {detail?.genres && detail.genres.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {detail.genres.map((g) => (
                          <span
                            key={g.id}
                            className="text-xs px-2.5 py-0.5 rounded-full"
                            style={{
                              background: "rgba(255,255,255,0.06)",
                              color: "rgba(255,255,255,0.5)",
                              border: "1px solid rgba(255,255,255,0.08)",
                            }}
                          >
                            {g.name}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* View Details — dikunci jika belum login */}
                    <button
                      onClick={handleViewDetail}
                      className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full transition-all"
                      style={{
                        background: user ? "rgba(239,68,68,0.12)" : "rgba(255,255,255,0.07)",
                        color: user ? "#f87171" : "rgba(255,255,255,0.45)",
                        border: user ? "1px solid rgba(239,68,68,0.25)" : "1px solid rgba(255,255,255,0.12)",
                      }}
                      onMouseEnter={(e) =>
                        Object.assign((e.currentTarget as HTMLButtonElement).style, {
                          background: user ? "rgba(239,68,68,0.22)" : "rgba(255,255,255,0.12)",
                          borderColor: user ? "rgba(239,68,68,0.45)" : "rgba(255,255,255,0.2)",
                        })
                      }
                      onMouseLeave={(e) =>
                        Object.assign((e.currentTarget as HTMLButtonElement).style, {
                          background: user ? "rgba(239,68,68,0.12)" : "rgba(255,255,255,0.07)",
                          borderColor: user ? "rgba(239,68,68,0.25)" : "rgba(255,255,255,0.12)",
                        })
                      }
                    >
                      {!authLoading && !user ? (
                        <svg className="w-3 h-3 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                        </svg>
                      ) : (
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                        </svg>
                      )}
                      View Details
                    </button>
                  </div>
                </div>
              </div>

              {/* Tabs */}
              <div className="flex gap-1 mb-5 border-b border-white/[0.06]">
                {(["episodes", "about"] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-4 py-2 text-sm font-medium capitalize transition-all border-b-2 -mb-px ${
                      activeTab === tab
                        ? "text-white border-red-500"
                        : "text-white/35 border-transparent hover:text-white/60"
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              {/* Tab: Episodes */}
              {activeTab === "episodes" && (
                <div className="flex gap-4" style={{ minHeight: 320 }}>
                  {/* Season sidebar */}
                  <div
                    className="flex-shrink-0 overflow-y-auto"
                    style={{ width: 150, maxHeight: 420, scrollbarWidth: "none" }}
                  >
                    {realSeasons.map((s) => (
                      <button
                        key={s.season_number}
                        onClick={() => setActiveSeason(s.season_number)}
                        className={`w-full text-left px-3 py-2.5 rounded-lg mb-1 transition-all ${
                          activeSeason === s.season_number
                            ? "bg-red-600/15 text-white"
                            : "text-white/40 hover:text-white/70 hover:bg-white/[0.04]"
                        }`}
                      >
                        <p className="text-xs font-semibold leading-tight">{s.name}</p>
                        <p className="text-[10px] text-white/30 mt-0.5">{s.episode_count} eps</p>
                      </button>
                    ))}
                  </div>

                  {/* Episode list */}
                  <div className="flex-1 overflow-y-auto" style={{ maxHeight: 420, scrollbarWidth: "none" }}>
                    {episodesLoading ? (
                      <div className="flex items-center justify-center h-40">
                        <div className="w-6 h-6 border-2 border-white/20 border-t-white/60 rounded-full animate-spin" />
                      </div>
                    ) : episodes.length === 0 ? (
                      <p className="text-white/25 text-sm text-center mt-10">No episodes found.</p>
                    ) : (
                      <div className="space-y-2 pr-1">
                        {episodes.map((ep) => (
                          <div
                            key={ep.id}
                            className="rounded-xl overflow-hidden cursor-pointer transition-all group"
                            style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}
                            onClick={() => setExpandedEp(expandedEp === ep.id ? null : ep.id)}
                          >
                            <div className="flex gap-3 p-3">
                              {/* Thumbnail with play overlay */}
                              <div
                                className="flex-shrink-0 rounded-lg overflow-hidden relative"
                                style={{ width: 100, height: 60, background: "rgba(255,255,255,0.06)" }}
                              >
                                {ep.still_path ? (
                                  <img
                                    src={`https://image.tmdb.org/t/p/w300${ep.still_path}`}
                                    alt={ep.name}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-white/15">
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                      <path d="M4 6h16v2H4zm0 5h16v2H4zm0 5h16v2H4z" />
                                    </svg>
                                  </div>
                                )}
                                {/* Play overlay on hover */}
                                <div
                                  className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                  style={{ background: "rgba(0,0,0,0.55)" }}
                                  onClick={(e) => handleWatchEpisode(ep, e)}
                                >
                                  <div
                                    className="w-7 h-7 rounded-full flex items-center justify-center"
                                    style={{ background: user ? "rgba(239,68,68,0.9)" : "rgba(255,255,255,0.25)" }}
                                  >
                                    {user ? (
                                      <svg className="w-3.5 h-3.5 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M8 5v14l11-7z" />
                                      </svg>
                                    ) : (
                                      <svg className="w-3 h-3 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                                      </svg>
                                    )}
                                  </div>
                                </div>
                              </div>

                              {/* Info */}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between gap-2">
                                  <div className="min-w-0 flex-1">
                                    <span className="text-white/30 text-[10px] font-mono">
                                      E{String(ep.episode_number).padStart(2, "0")}
                                    </span>
                                    <p className="text-white/85 text-xs font-semibold leading-tight line-clamp-1 mt-0.5">
                                      {ep.name}
                                    </p>
                                  </div>
                                  <div className="flex-shrink-0 flex flex-col items-end gap-1">
                                    {ep.vote_average > 0 && (
                                      <span className="text-yellow-400 text-[10px] font-bold">
                                        {ep.vote_average.toFixed(1)}
                                      </span>
                                    )}
                                    {ep.runtime && (
                                      <p className="text-white/25 text-[10px]">{ep.runtime}m</p>
                                    )}
                                  </div>
                                </div>
                                {ep.air_date && (
                                  <p className="text-white/25 text-[10px] mt-1">{ep.air_date}</p>
                                )}
                                {/* Watch button */}
                                <button
                                  onClick={(e) => handleWatchEpisode(ep, e)}
                                  className="mt-2 flex items-center gap-1 text-[10px] font-semibold px-2.5 py-1 rounded-full opacity-0 group-hover:opacity-100 transition-all"
                                  style={{
                                    background: user ? "rgba(239,68,68,0.15)" : "rgba(255,255,255,0.08)",
                                    color: user ? "#f87171" : "rgba(255,255,255,0.45)",
                                    border: user ? "1px solid rgba(239,68,68,0.3)" : "1px solid rgba(255,255,255,0.15)",
                                  }}
                                  onMouseEnter={(e) =>
                                    Object.assign((e.currentTarget as HTMLButtonElement).style, {
                                      background: user ? "rgba(239,68,68,0.28)" : "rgba(255,255,255,0.14)",
                                      borderColor: user ? "rgba(239,68,68,0.55)" : "rgba(255,255,255,0.25)",
                                    })
                                  }
                                  onMouseLeave={(e) =>
                                    Object.assign((e.currentTarget as HTMLButtonElement).style, {
                                      background: user ? "rgba(239,68,68,0.15)" : "rgba(255,255,255,0.08)",
                                      borderColor: user ? "rgba(239,68,68,0.3)" : "rgba(255,255,255,0.15)",
                                    })
                                  }
                                >
                                  {user ? (
                                    <svg className="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 24 24">
                                      <path d="M8 5v14l11-7z" />
                                    </svg>
                                  ) : (
                                    <svg className="w-2.5 h-2.5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                                      <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                                    </svg>
                                  )}
                                  {user ? "Watch" : "Login to Watch"}
                                </button>
                              </div>
                            </div>

                            {/* Expanded overview */}
                            {expandedEp === ep.id && ep.overview && (
                              <div className="px-3 pb-3">
                                <p className="text-white/50 text-xs leading-relaxed border-t border-white/[0.06] pt-2">
                                  {ep.overview}
                                </p>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Tab: About */}
              {activeTab === "about" && (
                <div className="space-y-4">
                  {detail?.overview && (
                    <p className="text-white/60 text-sm leading-relaxed">{detail.overview}</p>
                  )}
                  <div className="grid grid-cols-2 gap-3">
                    {detail?.networks && detail.networks.length > 0 && (
                      <div>
                        <p className="text-white/25 text-[10px] uppercase tracking-widest mb-1">Network</p>
                        <p className="text-white/70 text-sm">{detail.networks.map((n) => n.name).join(", ")}</p>
                      </div>
                    )}
                    {detail?.type && (
                      <div>
                        <p className="text-white/25 text-[10px] uppercase tracking-widest mb-1">Type</p>
                        <p className="text-white/70 text-sm">{detail.type}</p>
                      </div>
                    )}
                    {detail?.created_by && detail.created_by.length > 0 && (
                      <div>
                        <p className="text-white/25 text-[10px] uppercase tracking-widest mb-1">Created by</p>
                        <p className="text-white/70 text-sm">{detail.created_by.map((c) => c.name).join(", ")}</p>
                      </div>
                    )}
                    {detail?.number_of_episodes && (
                      <div>
                        <p className="text-white/25 text-[10px] uppercase tracking-widest mb-1">Total episodes</p>
                        <p className="text-white/70 text-sm">{detail.number_of_episodes}</p>
                      </div>
                    )}
                    {detail?.last_air_date && (
                      <div>
                        <p className="text-white/25 text-[10px] uppercase tracking-widest mb-1">Last aired</p>
                        <p className="text-white/70 text-sm">{detail.last_air_date}</p>
                      </div>
                    )}
                    {detail?.spoken_languages && detail.spoken_languages.length > 0 && (
                      <div>
                        <p className="text-white/25 text-[10px] uppercase tracking-widest mb-1">Language</p>
                        <p className="text-white/70 text-sm">{detail.spoken_languages.map((l) => l.name).join(", ")}</p>
                      </div>
                    )}
                  </div>
                  <CommentSection movieId={movie.id} />
                </div>
              )}
            </div>
          </div>
          {/* end content wrapper */}

          {/* ── Paywall Overlay ───────────────────────────────────────── */}
          {isLocked && <LoginOverlay />}
        </div>
      </div>
    </>
  );
}