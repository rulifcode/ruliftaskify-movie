"use client";

import WatchSection from "@/components/WatchSection";
import { useState, useEffect } from "react";
import TrendingSection from "@/components/TrendingSection";
import MovieGrid from "@/components/MovieGrid";
import { getPopularMovies, searchMovies } from "@/services/movieService";
import Footer from "@/components/Footer";
import {
  getSeasonEpisodes,
  getPopularSeries,
  Episode,
  Season,
} from "@/services/seriesService";

type Genre = { id: number; name: string };
type Video = { key: string; type: string; site: string; name: string };
type Network = { id: number; name: string; logo_path: string | null };
type Creator = { id: number; name: string };

export type SeriesForHero = {
  id: number;
  name: string;
  overview: string;
  backdrop_path?: string;
  poster_path?: string;
  vote_average?: number;
  first_air_date?: string;
  last_air_date?: string;
  status?: string;
  number_of_seasons?: number;
  number_of_episodes?: number;
  genres?: Genre[];
  seasons?: Season[];
  networks?: Network[];
  created_by?: Creator[];
  videos?: { results: Video[] };
  tagline?: string;
};

// ── Reused from MovieDetailHero ──────────────────────────────────────────────

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
      className="relative flex-shrink-0 rounded-lg overflow-hidden transition-all duration-250"
      style={{
        width: "calc(20% - 0.4rem)",
        minWidth: "68px",
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
          height: "48px",
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
            width: hovering || isActive ? 22 : 18,
            height: hovering || isActive ? 22 : 18,
            background: isActive
              ? "#ef4444"
              : hovering
                ? "rgba(255,255,255,0.4)"
                : "rgba(255,255,255,0.22)",
            transition: "all 0.2s ease",
          }}
        >
          <svg width="7" height="7" fill="white" viewBox="0 0 20 20">
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

// ── Episode List (inline, no modal) ─────────────────────────────────────────

function EpisodeList({ seriesId, seasons }: { seriesId: number; seasons: Season[] }) {
  const realSeasons = seasons.filter((s) => s.season_number > 0);
  const [activeSeason, setActiveSeason] = useState(realSeasons[0]?.season_number ?? 1);
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    getSeasonEpisodes(seriesId, activeSeason)
      .then(setEpisodes)
      .finally(() => setLoading(false));
  }, [seriesId, activeSeason]);

  return (
    <div style={{ marginTop: "3rem", padding: "0 3.5rem" }}>
      <div className="flex items-center gap-3" style={{ marginBottom: "1.5rem" }}>
        <span className="inline-block w-1 h-5 rounded-full bg-red-500" />
        <h2 className="text-white text-lg font-semibold tracking-wide">Episodes</h2>
        <div className="flex-1 h-px bg-white/5" />
      </div>

      {/* Season tabs */}
      <div className="flex gap-2 flex-wrap" style={{ marginBottom: "1.5rem" }}>
        {realSeasons.map((s) => (
          <button
            key={s.season_number}
            onClick={() => setActiveSeason(s.season_number)}
            className="text-xs font-semibold px-3 py-1.5 rounded-full transition-all"
            style={{
              background: activeSeason === s.season_number ? "rgba(239,68,68,0.15)" : "rgba(255,255,255,0.05)",
              color: activeSeason === s.season_number ? "#f87171" : "rgba(255,255,255,0.4)",
              border: `1px solid ${activeSeason === s.season_number ? "rgba(239,68,68,0.35)" : "rgba(255,255,255,0.08)"}`,
            }}
          >
            {s.name}
          </button>
        ))}
      </div>

      {/* Episode grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="rounded-xl animate-pulse" style={{ height: 80, background: "rgba(255,255,255,0.05)" }} />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {episodes.map((ep) => (
            <a
              key={ep.id}
              href={`/tv/${seriesId}/season/${activeSeason}/episode/${ep.episode_number}`}
              className="group flex gap-3 rounded-xl p-3 transition-all"
              style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.06)",
                textDecoration: "none",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.07)";
                (e.currentTarget as HTMLElement).style.borderColor = "rgba(239,68,68,0.25)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.04)";
                (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.06)";
              }}
            >
              {/* Thumbnail */}
              <div
                className="flex-shrink-0 rounded-lg overflow-hidden relative"
                style={{ width: 96, height: 58, background: "rgba(255,255,255,0.06)" }}
              >
                {ep.still_path ? (
                  <img
                    src={`https://image.tmdb.org/t/p/w300${ep.still_path}`}
                    alt={ep.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center" style={{ color: "rgba(255,255,255,0.15)" }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M4 6h16v2H4zm0 5h16v2H4zm0 5h16v2H4z" />
                    </svg>
                  </div>
                )}
                {/* Play overlay */}
                <div
                  className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{ background: "rgba(0,0,0,0.5)" }}
                >
                  <div className="w-7 h-7 rounded-full flex items-center justify-center" style={{ background: "rgba(239,68,68,0.9)" }}>
                    <svg className="ml-0.5" width="10" height="10" fill="white" viewBox="0 0 20 20">
                      <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <span style={{ fontSize: "10px", color: "rgba(255,255,255,0.3)", fontFamily: "monospace" }}>
                      E{String(ep.episode_number).padStart(2, "0")}
                    </span>
                    <p className="text-white font-semibold leading-tight line-clamp-1" style={{ fontSize: "12px", marginTop: 2 }}>
                      {ep.name}
                    </p>
                  </div>
                  {ep.vote_average > 0 && (
                    <span className="flex-shrink-0 text-yellow-400 font-bold" style={{ fontSize: "10px" }}>
                      ★ {ep.vote_average.toFixed(1)}
                    </span>
                  )}
                </div>
                {ep.overview && (
                  <p className="line-clamp-2" style={{ fontSize: "10px", color: "rgba(255,255,255,0.35)", marginTop: 4, lineHeight: 1.5 }}>
                    {ep.overview}
                  </p>
                )}
                <div className="flex items-center gap-2" style={{ marginTop: 4 }}>
                  {ep.air_date && (
                    <span style={{ fontSize: "9px", color: "rgba(255,255,255,0.2)" }}>{ep.air_date}</span>
                  )}
                  {ep.runtime && (
                    <span style={{ fontSize: "9px", color: "rgba(255,255,255,0.2)" }}>{ep.runtime}m</span>
                  )}
                </div>
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Popular Series Section ───────────────────────────────────────────────────

function PopularSeriesSection({ onSeriesClick }: { onSeriesClick: (s: any) => void }) {
  const [series, setSeries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getPopularSeries()
      .then((data) => setSeries(data?.results ?? []))
      .finally(() => setLoading(false));
  }, []);

  return (
    <MovieGrid
      movies={series}
      loading={loading}
      query=""
      onQueryChange={() => {}}
      onSearch={() => {}}
      onMovieClick={onSeriesClick}
    />
  );
}

// ── MAIN COMPONENT ───────────────────────────────────────────────────────────

export default function TvDetailHero({ series }: { series: SeriesForHero }) {
  const videos = series.videos?.results?.filter((v) => v.site === "YouTube") ?? [];
  const trailer = videos.find((v) => v.type === "Trailer") ?? videos[0];
  const [activeVideo, setActiveVideo] = useState<Video | null>(trailer ?? null);
  const [showTrailer, setShowTrailer] = useState(false);

  const year = series.first_air_date?.split("-")[0];
  const ratingPercent = Math.round((series.vote_average ?? 0) * 10);
  const realSeasons = (series.seasons ?? []).filter((s) => s.season_number > 0);

  const statusColor =
    series.status === "Returning Series"
      ? "#34d399"
      : series.status === "Ended"
        ? "#f87171"
        : "rgba(255,255,255,0.4)";

  return (
    <div className="relative w-full bg-[#080a0f] text-white font-sans overflow-hidden">
      {/* ── SECTION 1: HERO ── */}
      <div className="relative w-full" style={{ minHeight: "100vh" }}>
        {(series.backdrop_path || series.poster_path) && (
          <img
            src={`https://image.tmdb.org/t/p/original${series.backdrop_path ?? series.poster_path}`}
            alt=""
            aria-hidden
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
          <div className="flex flex-col lg:flex-row items-stretch flex-1">
            {/* LEFT: Info */}
            <div
              className="flex flex-col justify-center flex-1"
              style={{ padding: "4rem 3rem 3rem 3.5rem" }}
            >
              {/* Badges row */}
              <div className="flex items-center gap-2 flex-wrap" style={{ marginBottom: "0.75rem" }}>
                {/* TV badge */}
                <div
                  className="flex flex-col items-center justify-center bg-red-600 rounded text-white font-black leading-none"
                  style={{ padding: "4px 8px" }}
                >
                  <span style={{ fontSize: "8px", letterSpacing: "0.12em", textTransform: "uppercase" }}>TV</span>
                  <span style={{ fontSize: "13px", lineHeight: 1 }}>Series</span>
                </div>

                {ratingPercent > 0 && (
                  <span className="flex items-center gap-1 font-bold text-green-400" style={{ fontSize: "13px" }}>
                    <svg width="13" height="13" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    {ratingPercent}%
                  </span>
                )}

                {year && (
                  <span style={{ color: "rgba(255,255,255,0.4)", fontSize: "13px" }}>{year}</span>
                )}

                {series.number_of_seasons && (
                  <span style={{ border: "1px solid rgba(255,255,255,0.18)", padding: "1px 8px", borderRadius: "4px", color: "rgba(255,255,255,0.4)", fontSize: "12px" }}>
                    {series.number_of_seasons} Season{series.number_of_seasons > 1 ? "s" : ""}
                  </span>
                )}

                {series.status && (
                  <span style={{ border: `1px solid ${statusColor}40`, padding: "1px 8px", borderRadius: "4px", color: statusColor, fontSize: "12px" }}>
                    {series.status}
                  </span>
                )}

                {series.genres?.slice(0, 3).map((g) => (
                  <span key={g.id} style={{ color: "rgba(255,255,255,0.32)", fontSize: "12px" }}>{g.name}</span>
                ))}
              </div>

              <h1
                className="font-black tracking-tight uppercase leading-none"
                style={{ fontSize: "clamp(2.4rem, 5vw, 4.8rem)", marginBottom: "0.6rem" }}
              >
                {series.name}
              </h1>

              {series.tagline && (
                <p style={{ color: "rgba(255,255,255,0.3)", fontSize: "13px", fontStyle: "italic", marginBottom: "0.5rem" }}>
                  "{series.tagline}"
                </p>
              )}

              <p
                style={{
                  color: "rgba(255,255,255,0.52)",
                  lineHeight: 1.6,
                  fontSize: "clamp(0.82rem, 1.2vw, 0.95rem)",
                  marginBottom: "1.1rem",
                }}
              >
                {series.overview}
              </p>

              {/* Created by */}
              {series.created_by && series.created_by.length > 0 && (
                <div style={{ marginBottom: "1.1rem" }}>
                  <p style={{ fontSize: "10px", fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: "rgba(255,255,255,0.22)", marginBottom: "4px" }}>
                    Created by
                  </p>
                  <p style={{ color: "rgba(255,255,255,0.6)", fontSize: "13px" }}>
                    {series.created_by.map((c) => c.name).join(", ")}
                  </p>
                </div>
              )}

              {/* Networks */}
              {series.networks && series.networks.length > 0 && (
                <div style={{ marginBottom: "1.1rem" }}>
                  <p style={{ fontSize: "10px", fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: "rgba(255,255,255,0.22)", marginBottom: "6px" }}>
                    Network
                  </p>
                  <div className="flex items-center gap-3">
                    {series.networks.map((n) => (
                      <span key={n.id} style={{ color: "rgba(255,255,255,0.5)", fontSize: "13px" }}>{n.name}</span>
                    ))}
                  </div>
                </div>
              )}

              {/* CTA Buttons */}
              <div className="flex items-center gap-3 flex-wrap">
                {trailer && (
                  <button
                    onClick={() => setShowTrailer(true)}
                    className="flex items-center gap-2 bg-red-600 hover:bg-red-500 active:scale-95 transition-all duration-200 font-bold rounded-full"
                    style={{ padding: "10px 28px", fontSize: "13px", boxShadow: "0 4px 20px rgba(220,38,38,0.35)" }}
                  >
                    <svg width="14" height="14" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                    </svg>
                    Play Trailer
                  </button>
                )}
                <a
                  href="#episodes"
                  className="flex items-center gap-2 font-bold rounded-full transition-all duration-200 active:scale-95"
                  style={{ padding: "10px 28px", fontSize: "13px", background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.1)", color: "white", textDecoration: "none" }}
                  onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.18)")}
                  onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.1)")}
                >
                  <svg width="14" height="14" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                  </svg>
                  Watch Episodes
                </a>
                <button
                  className="flex items-center gap-2 font-bold rounded-full transition-all duration-200 active:scale-95"
                  style={{ padding: "10px 28px", fontSize: "13px", background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.1)" }}
                  onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.18)")}
                  onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.1)")}
                >
                  <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                  </svg>
                  My Watchlist
                </button>
              </div>
            </div>

            {/* RIGHT: Trailer */}
            {activeVideo && (
              <div
                className="flex-shrink-0 flex flex-col justify-center"
                style={{ width: "44%", padding: "2.5rem 2rem 2.5rem 1rem" }}
              >
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

                {videos.length > 1 && (
                  <div className="flex gap-2 flex-wrap" style={{ marginTop: "10px" }}>
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
            )}
          </div>
        </div>
      </div>

      {/* ── SECTION 2: EPISODES ── */}
      {realSeasons.length > 0 && (
        <div id="episodes">
          <EpisodeList seriesId={series.id} seasons={series.seasons ?? []} />
        </div>
      )}

      {/* ── SECTION 3: TRENDING ── */}
      <div style={{ padding: "3rem 3.5rem" }}>
        <TrendingSection onMovieClick={(m) => {
          window.location.href = `/movie/${m.id}`;
        }} />
      </div>

      {/* ── SECTION 4: POPULAR SERIES ── */}
      <div style={{ padding: "3rem 3.5rem" }}>
        <PopularSeriesSection onSeriesClick={(s) => {
          window.location.href = `/tv/${s.id}`;
        }} />
      </div>

      <Footer />

      {/* Fullscreen Trailer Modal */}
      {showTrailer && activeVideo && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ background: "rgba(0,0,0,0.95)" }}
          onClick={() => setShowTrailer(false)}
        >
          <div
            className="relative w-full max-w-5xl"
            style={{ margin: "0 1rem" }}
            onClick={(e) => e.stopPropagation()}
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