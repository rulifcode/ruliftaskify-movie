"use client";

import { useState } from "react";
import Link from "next/link";
import { SeriesDetails } from "@/services/seriesService";
import CommentSection from "./CommentSection";

type Props = {
  series: SeriesDetails;
};

export default function TvDetailHero({ series }: Props) {
  const [activeTab, setActiveTab] = useState<"about" | "seasons">("about");

  const backdrop = series.backdrop_path
    ? `https://image.tmdb.org/t/p/w1280${series.backdrop_path}`
    : null;
  const poster = series.poster_path
    ? `https://image.tmdb.org/t/p/w342${series.poster_path}`
    : null;

  const rating = series.vote_average ?? 0;
  const ratingColor =
    rating >= 7.5 ? "#34d399" : rating >= 6 ? "#facc15" : "#f87171";

  const realSeasons = (series.seasons ?? []).filter((s) => s.season_number > 0);

  return (
    <div className="min-h-screen bg-[#080a0f] text-white">
      {/* Hero backdrop */}
      <div className="relative w-full" style={{ aspectRatio: "21/9", maxHeight: 500 }}>
        {backdrop ? (
          <img
            src={backdrop}
            alt={series.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-white/5" />
        )}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to top, #080a0f 0%, rgba(8,10,15,0.6) 50%, transparent 100%)",
          }}
        />
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-6 -mt-32 relative z-10 pb-20">
        <div className="flex gap-6 mb-8">
          {/* Poster */}
          {poster && (
            <img
              src={poster}
              alt={series.name}
              className="flex-shrink-0 rounded-2xl object-cover shadow-2xl border border-white/10"
              style={{ width: 160, height: 240 }}
            />
          )}

          {/* Info */}
          <div className="flex-1 min-w-0 pt-16">
            <h1 className="text-white text-4xl font-black leading-tight mb-2">
              {series.name}
            </h1>

            {series.tagline && (
              <p className="text-white/40 text-sm italic mb-4">"{series.tagline}"</p>
            )}

            {/* Meta row */}
            <div className="flex flex-wrap items-center gap-3 mb-4">
              {/* Rating */}
              <div className="flex items-center gap-1.5">
                <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                <span className="font-bold text-lg" style={{ color: ratingColor }}>
                  {rating.toFixed(1)}
                </span>
                <span className="text-white/30 text-sm">/10</span>
              </div>

              {series.first_air_date && (
                <span className="text-white/40 text-sm">{series.first_air_date.slice(0, 4)}</span>
              )}

              {series.number_of_seasons && (
                <span className="text-white/40 text-sm">{series.number_of_seasons} Seasons</span>
              )}

              {series.number_of_episodes && (
                <span className="text-white/40 text-sm">{series.number_of_episodes} Episodes</span>
              )}

              {series.status && (
                <span
                  className="text-xs px-2.5 py-1 rounded-full font-medium"
                  style={{
                    background:
                      series.status === "Returning Series"
                        ? "rgba(52,211,153,0.1)"
                        : "rgba(255,255,255,0.06)",
                    color:
                      series.status === "Returning Series"
                        ? "#34d399"
                        : "rgba(255,255,255,0.4)",
                    border: `1px solid ${
                      series.status === "Returning Series"
                        ? "rgba(52,211,153,0.2)"
                        : "rgba(255,255,255,0.08)"
                    }`,
                  }}
                >
                  {series.status}
                </span>
              )}
            </div>

            {/* Genres */}
            {series.genres && series.genres.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-5">
                {series.genres.map((g) => (
                  <span
                    key={g.id}
                    className="text-xs px-3 py-1 rounded-full"
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

            {/* Watch button */}
            {realSeasons.length > 0 && (
              <Link
                href={`/tv/${series.id}/season/1/episode/1`}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm text-white transition-opacity hover:opacity-90"
                style={{ background: "#dc2626" }}
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
                Watch Now
              </Link>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 border-b border-white/[0.06]">
          {(["about", "seasons"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2.5 text-sm font-medium capitalize transition-all border-b-2 -mb-px ${
                activeTab === tab
                  ? "text-white border-red-500"
                  : "text-white/35 border-transparent hover:text-white/60"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Tab: About */}
        {activeTab === "about" && (
          <div className="space-y-6">
            {series.overview && (
              <p className="text-white/65 text-base leading-relaxed">{series.overview}</p>
            )}

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {series.networks && series.networks.length > 0 && (
                <div>
                  <p className="text-white/25 text-[10px] uppercase tracking-widest mb-1">Network</p>
                  <p className="text-white/70 text-sm">{series.networks.map((n) => n.name).join(", ")}</p>
                </div>
              )}
              {series.type && (
                <div>
                  <p className="text-white/25 text-[10px] uppercase tracking-widest mb-1">Type</p>
                  <p className="text-white/70 text-sm">{series.type}</p>
                </div>
              )}
              {series.created_by && series.created_by.length > 0 && (
                <div>
                  <p className="text-white/25 text-[10px] uppercase tracking-widest mb-1">Created by</p>
                  <p className="text-white/70 text-sm">{series.created_by.map((c) => c.name).join(", ")}</p>
                </div>
              )}
              {series.last_air_date && (
                <div>
                  <p className="text-white/25 text-[10px] uppercase tracking-widest mb-1">Last Aired</p>
                  <p className="text-white/70 text-sm">{series.last_air_date}</p>
                </div>
              )}
              {series.spoken_languages && series.spoken_languages.length > 0 && (
                <div>
                  <p className="text-white/25 text-[10px] uppercase tracking-widest mb-1">Language</p>
                  <p className="text-white/70 text-sm">{series.spoken_languages.map((l) => l.name).join(", ")}</p>
                </div>
              )}
            </div>

            <CommentSection movieId={series.id} />
          </div>
        )}

        {/* Tab: Seasons */}
        {activeTab === "seasons" && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {realSeasons.map((season) => (
              <Link
                key={season.season_number}
                href={`/tv/${series.id}/season/${season.season_number}`}
                className="group rounded-xl overflow-hidden border border-white/[0.06] bg-white/[0.03] hover:border-white/[0.12] transition-all"
              >
                {season.poster_path ? (
                  <img
                    src={`https://image.tmdb.org/t/p/w300${season.poster_path}`}
                    alt={season.name}
                    className="w-full aspect-[2/3] object-cover group-hover:opacity-80 transition-opacity"
                  />
                ) : (
                  <div className="w-full aspect-[2/3] bg-white/[0.04] flex items-center justify-center text-white/20">
                    <svg width="32" height="32" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M4 6h16v2H4zm0 5h16v2H4zm0 5h16v2H4z" />
                    </svg>
                  </div>
                )}
                <div className="p-3">
                  <p className="text-white/85 text-sm font-semibold leading-tight">{season.name}</p>
                  <p className="text-white/35 text-xs mt-0.5">{season.episode_count} episodes</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}