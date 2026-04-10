"use client";

import { useEffect, useState } from "react";
import { Movie } from "@/types/movie";

type Props = {
  title: string;
  badge?: string;
  fetchFn: () => Promise<{ results: Movie[] }>;
  onMovieClick?: (movie: Movie) => void;
  activeGenres?: number[];
  searchQuery?: string;
};

const PER_PAGE = 18;

export default function GridSection({ title, badge, fetchFn, onMovieClick, activeGenres = [], searchQuery = "" }: Props) {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  // ✅ Fix 1: tambah fetchFn di dependency agar re-fetch saat sort/tab berubah
  useEffect(() => {
    setLoading(true);
    setMovies([]);
    fetchFn()
      .then((data) => setMovies(data.results ?? []))
      .finally(() => setLoading(false));
  }, [fetchFn]);

  // Reset ke page 1 setiap kali filter berubah
  useEffect(() => {
    setPage(1);
  }, [activeGenres, searchQuery]);

  // Filter by genre
  const filteredByGenre =
    activeGenres.length > 0
      ? movies.filter((m) => m.genre_ids?.some((id) => activeGenres.includes(id)))
      : movies;

  // ✅ Fix 2: support both movie.title (movies) dan movie.name (series)
  const filtered =
    searchQuery.length > 0
      ? filteredByGenre.filter((m) =>
          (m.title ?? m.name)?.toLowerCase().includes(searchQuery.toLowerCase())
        )
      : filteredByGenre;

  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const getDots = () => {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
    const dots: (number | "...")[] = [];
    if (page <= 4) {
      dots.push(1, 2, 3, 4, 5, "...", totalPages);
    } else if (page >= totalPages - 3) {
      dots.push(1, "...", totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
    } else {
      dots.push(1, "...", page - 1, page, page + 1, "...", totalPages);
    }
    return dots;
  };

  const isEmpty = !loading && filtered.length === 0;

  return (
    <section className="mb-14">
      {/* Header */}
      <div className="flex items-center gap-3 mb-5">
        <div className="flex items-center gap-2">
          <span className="inline-block w-1 h-5 rounded-full bg-red-500" />
          <h2 className="text-white text-lg font-semibold tracking-wide">{title}</h2>
          {badge && (
            <span className="text-[10px] font-bold bg-red-600/20 text-red-400 border border-red-500/20 px-2 py-0.5 rounded-full">
              {badge}
            </span>
          )}
        </div>
        <div className="flex-1 h-px bg-white/5" />
        {!loading && (
          <span className="text-white/30 text-xs font-mono uppercase tracking-widest">
            #{filtered.length} titles
          </span>
        )}
      </div>

      {/* Empty state */}
      {isEmpty && (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-14 h-14 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-4">
            <svg className="w-6 h-6 text-white/20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 4v16M17 4v16M3 8h4m10 0h4M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
            </svg>
          </div>
          <p className="text-white/30 text-sm font-semibold">No titles found</p>
          <p className="text-white/15 text-xs mt-1">
            {searchQuery ? `No results for "${searchQuery}"` : "Try selecting a different genre"}
          </p>
        </div>
      )}

      {/* Grid */}
      {!isEmpty && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {loading
            ? Array.from({ length: 18 }).map((_, i) => (
                <div key={i} className="rounded-xl overflow-hidden bg-white/5 border border-white/[0.06] animate-pulse">
                  <div className="aspect-[2/3] bg-white/10" />
                  <div className="p-3 space-y-2">
                    <div className="h-3 bg-white/10 rounded w-4/5" />
                    <div className="h-2.5 bg-white/10 rounded w-1/2" />
                  </div>
                </div>
              ))
            : paginated.map((item) => {
                // ✅ Fix 3: support both movie fields dan series fields
                const displayTitle = item.title ?? item.name ?? "Untitled";
                const displayDate = item.release_date ?? item.first_air_date ?? "";

                return (
                  <div
                    key={item.id}
                    onClick={() => onMovieClick?.(item)}
                    className="group rounded-xl overflow-hidden bg-white/5 border border-white/[0.06] hover:border-red-500/40 hover:-translate-y-1.5 hover:shadow-2xl hover:shadow-black/60 transition-all duration-300 cursor-pointer"
                  >
                    <div className="relative aspect-[2/3] overflow-hidden bg-white/10">
                      <img
                        src={`https://image.tmdb.org/t/p/w500${item.poster_path}`}
                        alt={displayTitle}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-3">
                        <div className="flex items-center gap-1.5 text-xs font-bold">
                          <div className="w-6 h-6 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center">
                            <svg className="w-3 h-3 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M8 5v14l11-7z" />
                            </svg>
                          </div>
                          Details
                        </div>
                      </div>
                    </div>
                    <div className="p-3">
                      <p className="text-xs font-semibold text-white leading-snug line-clamp-2 mb-1.5">
                        {displayTitle}
                      </p>
                      <div className="flex items-center justify-between text-[10px] text-white/40">
                        {item.vote_average ? (
                          <span className="flex items-center gap-1 text-yellow-400 font-bold">
                            <svg className="w-3 h-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                            {item.vote_average.toFixed(1)}
                          </span>
                        ) : <span />}
                        {displayDate && <span>{displayDate.slice(0, 4)}</span>}
                      </div>
                    </div>
                  </div>
                );
              })
          }
        </div>
      )}

      {/* Pagination */}
      {!loading && totalPages > 1 && (
        <div className="flex items-center justify-center gap-1.5 mt-10">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-white/40 hover:text-white hover:bg-white/10 disabled:opacity-20 disabled:cursor-not-allowed transition-all text-sm">
            ‹
          </button>
          {getDots().map((dot, i) =>
            dot === "..." ? (
              <span key={`e-${i}`} className="w-8 h-8 flex items-center justify-center text-white/30 text-xs select-none">···</span>
            ) : (
              <button
                key={dot}
                onClick={() => setPage(dot as number)}
                className={`w-8 h-8 flex items-center justify-center rounded-lg text-xs font-bold transition-all
                  ${page === dot ? "bg-red-600 text-white shadow-lg shadow-red-900/40" : "text-white/40 hover:text-white hover:bg-white/10"}`}>
                {dot}
              </button>
            )
          )}
          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-white/40 hover:text-white hover:bg-white/10 disabled:opacity-20 disabled:cursor-not-allowed transition-all text-sm">
            ›
          </button>
        </div>
      )}
    </section>
  );
}