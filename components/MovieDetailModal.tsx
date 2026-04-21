"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { getMovieDetailFull } from "@/services/movieService";
import { Movie } from "@/types/movie";
import CommentSection from "./CommentSection";

// ─── Types ────────────────────────────────────────────────────────────────────

type CastMember = {
  id: number;
  name: string;
  character: string;
  profile_path: string | null;
};

type Video = {
  key: string;
  type: string;
  site: string;
};

type DetailMovie = Movie & {
  overview?: string;
  genres?: { id: number; name: string }[];
  runtime?: number;
  tagline?: string;
  credits?: { cast: CastMember[] };
  videos?: { results: Video[] };
};

type Props = {
  movie: Movie | null;
  onClose: () => void;
  isLoggedIn?: boolean;
};

// ─── Constants ────────────────────────────────────────────────────────────────

const VIEW_COUNT_KEY = "movieModalViewCount";
const MAX_FREE_VIEWS = 5;

// ─── Helpers ─────────────────────────────────────────────────────────────────

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

// ─── Login Overlay (centered paywall) ────────────────────────────────────────

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
          menjelajahi semua film tanpa batas.
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

// ─── Main Component ───────────────────────────────────────────────────────────

export default function MovieDetailModal({
  movie,
  onClose,
  isLoggedIn = false,
}: Props) {
  const [detail, setDetail] = useState<DetailMovie | null>(null);
  const [showTrailer, setShowTrailer] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [isLocked, setIsLocked] = useState(false);

  // ── On movie open: check / increment view count ───────────────────────────
  useEffect(() => {
    if (!movie) {
      setDetail(null);
      setShowTrailer(false);
      setLoaded(false);
      setIsLocked(false);
      return;
    }

    if (isLoggedIn) {
      setIsLocked(false);
    } else {
      const currentCount = getViewCount();

      if (currentCount >= MAX_FREE_VIEWS) {
        setIsLocked(true);
        setLoaded(true);
        return;
      }

      const newCount = incrementViewCount();
      setIsLocked(newCount > MAX_FREE_VIEWS);
    }

    setLoaded(false);
    getMovieDetailFull(movie.id).then((data) => {
      setDetail(data);
      setTimeout(() => setLoaded(true), 50);
    });
  }, [movie, isLoggedIn]);

  // ── Keyboard close ────────────────────────────────────────────────────────
  const handleKey = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    },
    [onClose]
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [handleKey]);

  if (!movie) return null;

  // ── Derived display values ────────────────────────────────────────────────
  const trailer = detail?.videos?.results?.find(
    (v) => v.type === "Trailer" && v.site === "YouTube"
  );
  const cast = detail?.credits?.cast?.slice(0, 8) ?? [];
  const backdrop = detail?.backdrop_path
    ? `https://image.tmdb.org/t/p/w1280${detail.backdrop_path}`
    : null;
  const poster = detail?.poster_path
    ? `https://image.tmdb.org/t/p/w342${detail.poster_path}`
    : null;
  const rating = detail?.vote_average ?? 0;
  const ratingColor =
    rating >= 7.5 ? "#34d399" : rating >= 6 ? "#facc15" : "#f87171";
  const runtime = detail?.runtime
    ? `${Math.floor(detail.runtime / 60)}h ${detail.runtime % 60}m`
    : null;

  const viewsUsed = isLoggedIn ? 0 : getViewCount();
  const viewsLeft = Math.max(0, MAX_FREE_VIEWS - viewsUsed);

  return (
    <>
      {/* Backdrop overlay */}
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6"
        onClick={onClose}
        style={{ background: "rgba(0,0,0,0.85)", backdropFilter: "blur(6px)" }}
      >
        {/* Modal */}
        <div
          className="relative w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded-2xl border border-white/[0.07] bg-[#0d0f15]"
          style={{
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
            {/* ── Hero / Trailer Area ──────────────────────────────────── */}
            <div className="relative w-full" style={{ aspectRatio: "16/9" }}>
              {showTrailer && trailer ? (
                <iframe
                  src={`https://www.youtube.com/embed/${trailer.key}?autoplay=1`}
                  className="w-full h-full rounded-t-2xl"
                  allow="autoplay; encrypted-media"
                  allowFullScreen
                />
              ) : (
                <>
                  {backdrop ? (
                    <img
                      src={backdrop}
                      alt={movie.title}
                      className="w-full h-full object-cover rounded-t-2xl"
                    />
                  ) : (
                    <div className="w-full h-full bg-white/5 rounded-t-2xl" />
                  )}
                  <div
                    className="absolute inset-0 rounded-t-2xl"
                    style={{
                      background:
                        "linear-gradient(to top, #0d0f15 0%, transparent 60%)",
                    }}
                  />
                  {trailer && (
                    <button
                      onClick={() => setShowTrailer(true)}
                      className="absolute inset-0 flex flex-col items-center justify-center gap-3 group"
                    >
                      <div
                        className="w-14 h-14 rounded-full flex items-center justify-center border border-white/20"
                        style={{
                          background: "rgba(255,255,255,0.12)",
                          backdropFilter: "blur(8px)",
                          transition: "transform 0.2s ease, background 0.2s ease",
                        }}
                      >
                        <svg
                          className="w-6 h-6 text-white ml-1"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d="M8 5v14l11-7z" />
                        </svg>
                      </div>
                      <span className="text-white/60 text-xs font-medium tracking-wide">
                        Watch Trailer
                      </span>
                    </button>
                  )}
                </>
              )}

              {/* ── Top-right action buttons ── */}
              <div className="absolute top-3 right-3 flex items-center gap-2 z-10">
                {/* Free views remaining badge */}
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

                {/* Full Details button */}
                <Link
                  href={`/movie/${movie.id}`}
                  onClick={(e) => e.stopPropagation()}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold tracking-wide text-white border border-white/15 backdrop-blur-md transition-opacity hover:opacity-80"
                  style={{ background: "rgba(220,38,38,0.85)" }}
                >
                  <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18 3H6a3 3 0 00-3 3v12a3 3 0 003 3h12a3 3 0 003-3V6a3 3 0 00-3-3zM8 17H6v-2h2v2zm0-4H6v-2h2v2zm0-4H6V7h2v2zm10 8h-2v-2h2v2zm0-4h-2v-2h2v2zm0-4h-2V7h2v2zM9 7h6v10H9V7z" />
                  </svg>
                  <span className="hidden sm:inline">Full Details</span>
                  <span className="sm:hidden">Details</span>
                </Link>

                {/* Close button */}
                <button
                  onClick={onClose}
                  className="w-7 h-7 rounded-full flex items-center justify-center border border-white/10 backdrop-blur-sm bg-black/50"
                >
                  <svg
                    className="w-3.5 h-3.5 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* ── Content ─────────────────────────────────────────────── */}
            <div className="p-4 md:p-5">
              <div className="flex gap-4">
                {poster && (
                  <img
                    src={poster}
                    alt={movie.title}
                    className="flex-shrink-0 rounded-xl object-cover shadow-lg"
                    style={{ width: 76, height: 114 }}
                  />
                )}

                <div className="flex-1 min-w-0">
                  <h2 className="text-white text-xl font-bold leading-tight mb-1">
                    {detail?.title ?? movie.title}
                  </h2>

                  {detail?.tagline && (
                    <p className="text-white/35 text-xs italic mb-2">
                      "{detail.tagline}"
                    </p>
                  )}

                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <div className="flex items-center gap-1">
                      <svg className="w-3 h-3 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                      <span className="text-sm font-bold" style={{ color: ratingColor }}>
                        {rating.toFixed(1)}
                      </span>
                      <span className="text-white/25 text-xs">/10</span>
                    </div>

                    {movie.release_date && (
                      <span className="text-white/35 text-xs">
                        {movie.release_date.slice(0, 4)}
                      </span>
                    )}
                    {runtime && (
                      <span className="text-white/35 text-xs">{runtime}</span>
                    )}
                  </div>

                  {detail?.genres && detail.genres.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {detail.genres.map((g) => (
                        <span
                          key={g.id}
                          className="text-xs px-2 py-0.5 rounded-full border border-white/[0.08] bg-white/[0.06] text-white/50"
                        >
                          {g.name}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {detail?.overview && (
                <p className="text-white/60 text-sm leading-relaxed mt-4">
                  {detail.overview}
                </p>
              )}

              {cast.length > 0 && (
                <div className="mt-5">
                  <h3 className="text-white/40 text-xs font-semibold uppercase tracking-widest mb-2.5">
                    Cast
                  </h3>
                  <div className="flex gap-2.5 overflow-x-auto pb-2" style={{ scrollbarWidth: "none" }}>
                    {cast.map((member) => (
                      <div key={member.id} className="flex-shrink-0 text-center" style={{ width: 60 }}>
                        <div className="w-12 h-12 rounded-full mx-auto overflow-hidden mb-1 border border-white/[0.08] bg-white/[0.06]">
                          {member.profile_path ? (
                            <img
                              src={`https://image.tmdb.org/t/p/w185${member.profile_path}`}
                              alt={member.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-white/20 text-base">
                              {member.name.charAt(0)}
                            </div>
                          )}
                        </div>
                        <p className="text-white/75 text-xs font-medium leading-tight line-clamp-2">
                          {member.name}
                        </p>
                        <p className="text-white/30 text-xs leading-tight line-clamp-1 mt-0.5">
                          {member.character}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Comment Section */}
              <CommentSection movieId={movie.id} />
            </div>
          </div>
          {/* end content wrapper */}

          {/* ── Paywall Overlay (centered, professional) ─────────────── */}
          {isLocked && <LoginOverlay />}
        </div>
      </div>
    </>
  );
}