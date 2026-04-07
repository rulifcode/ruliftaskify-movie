"use client";

import { useEffect, useState } from "react";
import { Movie } from "@/types/movie";

type Props = {
  title: string;
  badge?: string;
  fetchFn: () => Promise<{ results: Movie[] }>;
  onMovieClick?: (movie: Movie) => void;
};

const PER_PAGE = 18;

export default function GridSection({ title, badge, fetchFn, onMovieClick }: Props) {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  useEffect(() => {
    fetchFn()
      .then((data) => setMovies(data.results ?? []))
      .finally(() => setLoading(false));
  }, []);

  const totalPages = Math.ceil(movies.length / PER_PAGE);
  const paginated = movies.slice((page - 1) * PER_PAGE, page * PER_PAGE);

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
            #{movies.length} titles
          </span>
        )}
      </div>

      {/* Grid */}
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
          : paginated.map((movie) => (
              <div
                key={movie.id}
                onClick={() => onMovieClick?.(movie)}
                className="group rounded-xl overflow-hidden bg-white/5 border border-white/[0.06] hover:border-red-500/40 hover:-translate-y-1.5 hover:shadow-2xl hover:shadow-black/60 transition-all duration-300 cursor-pointer"
              >
                <div className="relative aspect-[2/3] overflow-hidden bg-white/10">
                  <img
                    src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                    alt={movie.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-3">
                    <div className="flex items-center gap-1.5 text-xs font-bold">
                      <div className="w-6 h-6 rounded-full bg-red-600 flex items-center justify-center text-[10px]">▶</div>
                      Details
                    </div>
                  </div>
                </div>
                <div className="p-3">
                  <p className="text-xs font-semibold text-white leading-snug line-clamp-2 mb-1.5">{movie.title}</p>
                  <div className="flex items-center justify-between text-[10px] text-white/40">
                    {movie.vote_average ? (
                      <span className="text-yellow-400 font-bold">★ {movie.vote_average.toFixed(1)}</span>
                    ) : <span />}
                    {movie.release_date && <span>{movie.release_date.slice(0, 4)}</span>}
                  </div>
                </div>
              </div>
            ))
        }
      </div>

      {/* Pagination dots */}
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