"use client";

import { useState, useMemo } from "react";
import Link from "next/link";

type Series = {
  id: number;
  name: string;
  poster_path: string | null;
  vote_average: number;
  first_air_date: string;
  genre_ids?: number[];
};

type Props = {
  related: Series[];
};

export default function RelatedSeries({ related }: Props) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    if (!query.trim()) return related;
    return related.filter((s) =>
      s.name.toLowerCase().includes(query.toLowerCase())
    );
  }, [query, related]);

  return (
    <section className="mt-12">
      {/* Header + Search */}
      <div className="flex items-center justify-between gap-4 mb-5 flex-wrap">
        <div>
          <h2 className="text-white text-lg font-bold">Related Series</h2>
          <p className="text-white/30 text-xs mt-0.5">You might also like</p>
        </div>

        {/* Search */}
        <div className="relative">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/30 pointer-events-none"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
          </svg>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search related..."
            className="bg-white/[0.05] border border-white/[0.08] text-white/80 placeholder-white/25 text-xs rounded-full pl-8 pr-4 py-2 w-48 outline-none focus:border-white/20 focus:bg-white/[0.08] transition-all"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors cursor-pointer"
            >
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <svg className="w-8 h-8 text-white/15 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
          </svg>
          <p className="text-white/30 text-sm">No series found for &quot;{query}&quot;</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {filtered.map((series) => (
            <Link
              key={series.id}
              href={`/tv/${series.id}`}
              className="group no-underline"
            >
              {/* Poster */}
              <div className="relative rounded-xl overflow-hidden bg-white/[0.06] aspect-[2/3] mb-2.5">
                {series.poster_path ? (
                  <img
                    src={`https://image.tmdb.org/t/p/w300${series.poster_path}`}
                    alt={series.name}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-white/10">
                    <svg width="32" height="32" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6zm16-4H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-8 12.5v-9l6 4.5-6 4.5z" />
                    </svg>
                  </div>
                )}

                {/* Rating badge */}
                {series.vote_average > 0 && (
                  <div className="absolute top-2 left-2 flex items-center gap-1 bg-black/70 backdrop-blur-sm px-1.5 py-0.5 rounded-md">
                    <svg className="w-2.5 h-2.5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    <span className="text-white/80 text-[10px] font-semibold">
                      {series.vote_average.toFixed(1)}
                    </span>
                  </div>
                )}

                {/* Hover overlay */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-200 flex items-center justify-center">
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-white/20 backdrop-blur-sm rounded-full p-2.5">
                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Title + Year */}
              <p className="text-white/80 text-xs font-semibold line-clamp-2 leading-tight group-hover:text-white transition-colors">
                {series.name}
              </p>
              {series.first_air_date && (
                <p className="text-white/30 text-[10px] mt-0.5">
                  {series.first_air_date.slice(0, 4)}
                </p>
              )}
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}