"use client";
import WatchSection from "@/components/WatchSection";
import { useState, useEffect } from "react";
import TrendingSection from "@/components/TrendingSection";
import MovieGrid from "@/components/MovieGrid";
import { getPopularMovies, searchMovies } from "@/services/movieService";
import Footer from "@/components/Footer";

type Genre = { id: number; name: string };
type CastMember = {
  id: number;
  name: string;
  character: string;
  profile_path: string | null;
};
type Video = { key: string; type: string; site: string; name: string };

type Movie = {
  id: number;
  title: string;
  overview: string;
  backdrop_path?: string;
  poster_path?: string;
  vote_average?: number;
  release_date?: string;
  runtime?: number;
  genres?: Genre[];
  credits?: { cast: CastMember[] };
  videos?: { results: Video[] };
};

function RunningBorder({ active, hovering }: { active: boolean; hovering: boolean }) {
  const show = active || hovering;
  const color = active ? "#ef4444" : "rgba(255,255,255,0.5)";
  return (
    <svg
      className="absolute inset-0 w-full h-full pointer-events-none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ borderRadius: "inherit" }}
    >
      <rect
        x="1" y="1"
        width="calc(100% - 2px)"
        height="calc(100% - 2px)"
        rx="7" ry="7"
        fill="none"
        stroke={color}
        strokeWidth={active ? "2" : "1.5"}
        strokeLinecap="round"
        style={{
          strokeDasharray: "600",
          strokeDashoffset: show ? "0" : "600",
          transition: show
            ? "stroke-dashoffset 0.5s cubic-bezier(0.4,0,0.2,1), stroke 0.2s, stroke-width 0.2s"
            : "stroke-dashoffset 0.3s ease-in, stroke 0.2s",
          opacity: show ? 1 : 0,
        }}
      />
    </svg>
  );
}

function VideoCard({
  v,
  isActive,
  onClick,
}: {
  v: Video;
  isActive: boolean;
  onClick: () => void;
}) {
  const [animating, setAnimating] = useState(false);
  const [hovering, setHovering] = useState(false);

  const handleClick = () => {
    setAnimating(false);
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setAnimating(true);
        setTimeout(() => setAnimating(false), 550);
      });
    });
    onClick();
  };

  return (
    <button
      onClick={handleClick}
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
      className="relative flex-shrink-0 rounded-lg overflow-hidden"
      style={{
        // Fixed width per card — muat 4 di mobile, 5 di desktop
        width: "clamp(72px, 18vw, 110px)",
        background: isActive
          ? "rgba(255,255,255,0.2)"
          : hovering
            ? "rgba(255,255,255,0.14)"
            : "rgba(255,255,255,0.08)",
        border: "1.5px solid transparent",
        transform: isActive ? "scale(1.06)" : hovering ? "scale(1.03)" : "scale(1)",
        transition: "transform 0.2s ease, background 0.2s ease",
      }}
    >
      <img
        src={`https://img.youtube.com/vi/${v.key}/mqdefault.jpg`}
        alt={v.name}
        className="w-full object-cover"
        style={{
          // Tinggi responsif — lebih besar di mobile
          height: "clamp(46px, 10vw, 64px)",
          opacity: isActive ? 1 : hovering ? 0.9 : 0.7,
          transition: "opacity 0.2s ease",
        }}
      />
      <div
        className="absolute inset-0 flex items-center justify-center"
        style={{
          background: isActive
            ? "rgba(0,0,0,0.15)"
            : hovering
              ? "rgba(0,0,0,0.22)"
              : "rgba(0,0,0,0.38)",
          transition: "background 0.2s ease",
        }}
      >
        <div
          className="rounded-full flex items-center justify-center"
          style={{
            width: hovering || isActive ? 24 : 20,
            height: hovering || isActive ? 24 : 20,
            background: isActive
              ? "#ef4444"
              : hovering
                ? "rgba(255,255,255,0.4)"
                : "rgba(255,255,255,0.22)",
            transition: "all 0.2s ease",
          }}
        >
          <svg width="8" height="8" fill="white" viewBox="0 0 20 20">
            <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
          </svg>
        </div>
      </div>
      <div
        className="absolute bottom-0 left-0 right-0 px-1.5 py-1"
        style={{
          background: "linear-gradient(to top, rgba(0,0,0,0.85), transparent)",
          opacity: hovering || isActive ? 1 : 0,
          transition: "opacity 0.2s ease",
        }}
      >
        <p style={{ fontSize: "9px", color: "rgba(255,255,255,0.8)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {v.name}
        </p>
      </div>
      <RunningBorder active={animating || isActive} hovering={hovering && !isActive} />
    </button>
  );
}

function PopularMoviesSection({ onMovieClick }: { onMovieClick: (m: any) => void }) {
  const [movies, setMovies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");

  useEffect(() => {
    getPopularMovies()
      .then((data) => setMovies(data?.results ?? []))
      .finally(() => setLoading(false));
  }, []);

  const handleSearch = async () => {
    if (!query.trim()) {
      setLoading(true);
      getPopularMovies()
        .then((data) => setMovies(data?.results ?? []))
        .finally(() => setLoading(false));
      return;
    }
    setLoading(true);
    searchMovies(query)
      .then((data) => setMovies(data?.results ?? []))
      .finally(() => setLoading(false));
  };

  return (
    <MovieGrid
      movies={movies}
      loading={loading}
      query={query}
      onQueryChange={setQuery}
      onSearch={handleSearch}
      onMovieClick={onMovieClick}
    />
  );
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────

export default function MovieDetailHero({ movie }: { movie: Movie }) {
  const videos = movie.videos?.results?.filter((v) => v.site === "YouTube") ?? [];
  const trailer = videos.find((v) => v.type === "Trailer") ?? videos[0];
  const [activeVideo, setActiveVideo] = useState<Video | null>(trailer ?? null);
  const [showTrailer, setShowTrailer] = useState(false);

  const cast = movie.credits?.cast?.slice(0, 8) ?? [];
  const year = movie.release_date?.split("-")[0];
  const ratingPercent = Math.round((movie.vote_average ?? 0) * 10);

  const formatRuntime = (mins?: number) => {
    if (!mins) return null;
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return `${h}h ${m}m`;
  };

  return (
    <div className="relative w-full bg-[#080a0f] text-white font-sans overflow-hidden">
      {/* ── SECTION 1: HERO ── */}
      <div className="relative w-full" style={{ minHeight: "100vh" }}>
        {(movie.backdrop_path || movie.poster_path) && (
          <img
            src={`https://image.tmdb.org/t/p/original${movie.backdrop_path ?? movie.poster_path}`}
            alt="" aria-hidden
            className="absolute inset-0 w-full h-full object-cover object-top"
            style={{ opacity: 0.28 }}
          />
        )}
        <div
          className="absolute inset-0"
          style={{
            background: `
              linear-gradient(to right, #080a0f 28%, transparent 65%),
              linear-gradient(to top, #080a0f 15%, transparent 55%),
              linear-gradient(to bottom, #080a0f 4%, transparent 25%)
            `,
          }}
        />

        <div className="relative z-10 flex flex-col min-h-screen">
          {/*
            LAYOUT:
            - Mobile (default): kolom — info di atas, video di bawah
            - Desktop (lg+): baris — info kiri, video kanan
          */}
          <div className="flex flex-col lg:flex-row items-stretch flex-1">

            {/* ── LEFT / TOP: Info ── */}
            <div
              className="flex flex-col justify-center flex-1"
              style={{ padding: "5rem 1.5rem 1.5rem 1.5rem" }}
              // Desktop override via Tailwind lg:
            >
              {/* Pakai className untuk padding responsif */}
              <div className="lg:pl-8 lg:pr-6 lg:py-12">

                {/* Meta badges */}
                <div className="flex items-center gap-2 flex-wrap mb-3">
                  <div
                    className="flex flex-col items-center justify-center bg-red-600 rounded text-white font-black leading-none"
                    style={{ padding: "4px 8px" }}
                  >
                    <span style={{ fontSize: "8px", letterSpacing: "0.12em", textTransform: "uppercase" }}>TOP</span>
                    <span style={{ fontSize: "20px", lineHeight: 1 }}>10</span>
                  </div>
                  {ratingPercent > 0 && (
                    <span className="flex items-center gap-1 font-bold text-green-400" style={{ fontSize: "13px" }}>
                      <svg width="13" height="13" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                      {ratingPercent}%
                    </span>
                  )}
                  {year && <span style={{ color: "rgba(255,255,255,0.4)", fontSize: "13px" }}>{year}</span>}
                  {movie.runtime && (
                    <span style={{ border: "1px solid rgba(255,255,255,0.18)", padding: "1px 8px", borderRadius: "4px", color: "rgba(255,255,255,0.4)", fontSize: "12px" }}>
                      {formatRuntime(movie.runtime)}
                    </span>
                  )}
                  {movie.genres?.slice(0, 3).map((g) => (
                    <span key={g.id} style={{ color: "rgba(255,255,255,0.32)", fontSize: "12px" }}>{g.name}</span>
                  ))}
                </div>

                {/* Title */}
                <h1
                  className="font-black tracking-tight uppercase leading-none mb-3"
                  style={{ fontSize: "clamp(2rem, 5vw, 4.8rem)" }}
                >
                  {movie.title}
                </h1>

                {/* Overview */}
                <p
                  className="mb-4"
                  style={{
                    color: "rgba(255,255,255,0.52)",
                    lineHeight: 1.6,
                    fontSize: "clamp(0.82rem, 1.2vw, 0.95rem)",
                    // Di mobile batasi 3 baris agar tidak terlalu panjang
                    display: "-webkit-box",
                    WebkitLineClamp: 4,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                  }}
                >
                  {movie.overview}
                </p>

                {/* Cast */}
                {cast.length > 0 && (
                  <div className="mb-4">
                    <p style={{ fontSize: "10px", fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: "rgba(255,255,255,0.22)", marginBottom: "6px" }}>
                      Starring
                    </p>
                    <div className="flex items-center gap-2 flex-wrap">
                      {cast.map((member) => (
                        <div key={member.id} title={`${member.name} as ${member.character}`} className="group relative">
                          {member.profile_path ? (
                            <img
                              src={`https://image.tmdb.org/t/p/w45${member.profile_path}`}
                              alt={member.name}
                              className="rounded-full object-cover group-hover:scale-110 transition-all duration-300"
                              style={{ width: 36, height: 36, outline: "2px solid rgba(255,255,255,0.12)" }}
                            />
                          ) : (
                            <div
                              className="rounded-full flex items-center justify-center font-bold group-hover:scale-110 transition-all duration-300"
                              style={{ width: 36, height: 36, background: "rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.4)", fontSize: "13px", outline: "2px solid rgba(255,255,255,0.12)" }}
                            >
                              {member.name[0]}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/*
                  TOMBOL — pakai flex-wrap agar di mobile bisa turun baris
                  tapi tidak scroll. Gap lebih kecil agar muat.
                  Play Trailer full width di mobile, sisanya 50/50.
                */}
                <div className="flex flex-wrap gap-2">
                  {/* Play Trailer — full width di mobile */}
                  <button
                    onClick={() => setShowTrailer(true)}
                    className="flex items-center justify-center gap-2 bg-red-600 hover:bg-red-500 active:scale-95 transition-all duration-200 font-bold rounded-full"
                    style={{
                      padding: "10px 20px",
                      fontSize: "13px",
                      boxShadow: "0 4px 20px rgba(220,38,38,0.35)",
                      whiteSpace: "nowrap",
                      // Full width di mobile, auto di desktop
                      flex: "1 1 100%",
                      maxWidth: "100%",
                    }}
                  >
                    <svg width="13" height="13" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                    </svg>
                    Play Trailer
                  </button>

                  {/* Watch Full Movie — 50% di mobile */}
                  <a
                    href="#watch"
                    className="flex items-center justify-center gap-2 font-bold rounded-full transition-all duration-200 active:scale-95"
                    style={{
                      padding: "10px 20px",
                      fontSize: "13px",
                      background: "rgba(255,255,255,0.1)",
                      border: "1px solid rgba(255,255,255,0.1)",
                      color: "white",
                      textDecoration: "none",
                      whiteSpace: "nowrap",
                      flex: "1 1 calc(50% - 4px)",
                    }}
                    onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.18)")}
                    onMouseLeave={e => (e.currentTarget.style.background = "rgba(255,255,255,0.1)")}
                  >
                    <svg width="13" height="13" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                    </svg>
                    Watch Movie
                  </a>

                  {/* My Wishlist — 50% di mobile */}
                  <button
                    className="flex items-center justify-center gap-2 font-bold rounded-full transition-all duration-200 active:scale-95"
                    style={{
                      padding: "10px 20px",
                      fontSize: "13px",
                      background: "rgba(255,255,255,0.1)",
                      border: "1px solid rgba(255,255,255,0.1)",
                      whiteSpace: "nowrap",
                      flex: "1 1 calc(50% - 4px)",
                    }}
                    onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.18)")}
                    onMouseLeave={e => (e.currentTarget.style.background = "rgba(255,255,255,0.1)")}
                  >
                    <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                    </svg>
                    My Wishlist
                  </button>
                </div>

              </div>
            </div>

            {/* ── RIGHT / BOTTOM: Trailer Player ── */}
            {activeVideo && (
              <div
                className="flex-shrink-0 flex flex-col justify-center"
                style={{
                  // Mobile: full width, padding kecil
                  // Desktop (lg): 44% width dengan padding normal
                  width: "100%",
                  padding: "0 1.5rem 2rem 1.5rem",
                }}
              >
                {/* Pakai className untuk override di desktop */}
                <div className="lg:w-[44vw] lg:pl-4 lg:pr-8 lg:py-10">

                  {/* Video player */}
                  <div
                    className="relative rounded-xl overflow-hidden"
                    style={{ boxShadow: "0 0 48px rgba(220,38,38,0.1), 0 8px 40px rgba(0,0,0,0.5)" }}
                  >
                    <div style={{ position: "relative", paddingBottom: "56.25%", height: 0 }}>
                      <iframe
                        key={activeVideo.key}
                        src={`https://www.youtube.com/embed/${activeVideo.key}?autoplay=1&mute=1&controls=1&modestbranding=1&rel=0`}
                        allow="autoplay; encrypted-media"
                        allowFullScreen
                        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", border: "none" }}
                      />
                    </div>
                    <div
                      style={{
                        position: "absolute", top: 8, left: 8,
                        background: "rgba(0,0,0,0.6)", padding: "3px 10px",
                        borderRadius: "20px", fontSize: "11px", color: "rgba(255,255,255,0.65)",
                      }}
                    >
                      {activeVideo.name}
                    </div>
                  </div>

                  {/* Video card thumbnails */}
                  {videos.length > 1 && (
                    <div
                      className="flex gap-2 mt-3"
                      style={{
                        overflowX: "auto",
                        paddingBottom: "4px",
                        scrollbarWidth: "none",
                        msOverflowStyle: "none",
                      }}
                    >
                      {videos.slice(0, 5).map((v) => (
                        <VideoCard
                          key={v.key}
                          v={v}
                          isActive={activeVideo?.key === v.key}
                          onClick={() => setActiveVideo(v)}
                        />
                      ))}
                    </div>
                  )}

                </div>
              </div>
            )}

          </div>
        </div>
      </div>

      {/* ── SECTION 2: WATCH FULL MOVIE ── */}
      <div id="watch">
        <WatchSection movie={movie} />
      </div>

      {/* ── SECTION 3: TRENDING MOVIES ── */}
      <div className="px-4 lg:px-14 py-12">
        <TrendingSection onMovieClick={(m) => {
          window.location.href = `/movie/${m.id}`;
        }} />
      </div>

      {/* ── SECTION 4: POPULAR MOVIES ── */}
      <div className="px-4 lg:px-14 py-12">
        <PopularMoviesSection onMovieClick={(m) => {
          window.location.href = `/movie/${m.id}`;
        }} />
      </div>

      <Footer />

      {/* ── Fullscreen trailer modal ── */}
      {showTrailer && activeVideo && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ background: "rgba(0,0,0,0.95)" }}
          onClick={() => setShowTrailer(false)}
        >
          <div
            className="relative w-full max-w-5xl mx-4"
            onClick={e => e.stopPropagation()}
          >
            <div className="rounded-2xl overflow-hidden" style={{ position: "relative", paddingBottom: "56.25%", height: 0 }}>
              <iframe
                src={`https://www.youtube.com/embed/${activeVideo.key}?autoplay=1&controls=1&rel=0`}
                allow="autoplay; encrypted-media"
                allowFullScreen
                style={{ position: "absolute", inset: 0, width: "100%", height: "100%", border: "none" }}
              />
            </div>
            <button
              onClick={() => setShowTrailer(false)}
              className="absolute flex items-center justify-center transition-colors"
              style={{
                top: -16, right: -16, width: 36, height: 36,
                background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)",
                borderRadius: "50%", fontSize: "16px", color: "white", cursor: "pointer",
              }}
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
}