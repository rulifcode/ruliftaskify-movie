import Link from "next/link";
import { useState } from "react";

type Movie = {
  id: number;
  title: string;
  poster_path: string;
  backdrop_path?: string;
  vote_average?: number;
  release_date?: string;
};

type MovieGridProps = {
  movies: Movie[];
  loading: boolean;
  query: string;
  onQueryChange: (q: string) => void;
  onSearch: () => void;
};

const FILMS_PER_PAGE = 18;

export default function MovieGrid({ movies, loading, query, onQueryChange, onSearch }: MovieGridProps) {
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(movies.length / FILMS_PER_PAGE);
  const paginated = movies.slice((currentPage - 1) * FILMS_PER_PAGE, currentPage * FILMS_PER_PAGE);

  // Reset ke halaman 1 kalau query berubah
  const handleQueryChange = (q: string) => {
    setCurrentPage(1);
    onQueryChange(q);
  };

  const handleSearch = () => {
    setCurrentPage(1);
    onSearch();
  };

  // Generate dot pages dengan ellipsis
  const getDots = () => {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);

    const dots: (number | "...")[] = [];
    if (currentPage <= 4) {
      dots.push(1, 2, 3, 4, 5, "...", totalPages);
    } else if (currentPage >= totalPages - 3) {
      dots.push(1, "...", totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
    } else {
      dots.push(1, "...", currentPage - 1, currentPage, currentPage + 1, "...", totalPages);
    }
    return dots;
  };

  return (
    <>
      {/* Section header + search */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <span className="w-1 h-5 bg-red-500 rounded-full block" />
          <h2 className="text-xl font-black tracking-wider uppercase">
            {query ? `Results for "${query}"` : "Popular Now"}
          </h2>
          {!loading && (
            <span className="text-xs text-white/30 font-medium">{movies.length} films</span>
          )}
        </div>

        <div className="flex gap-2.5">
          <div className="relative">
            <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none"
              width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              value={query}
              onChange={e => handleQueryChange(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleSearch()}
              placeholder="Search movies..."
              className="w-64 h-10 bg-white/5 border border-white/10 rounded-xl pl-9 pr-4 text-sm text-white placeholder-white/30 outline-none focus:border-red-500/50 transition-all"
            />
          </div>
          <button
            onClick={handleSearch}
            className="h-10 px-5 bg-red-600 hover:bg-red-500 text-white text-xs font-bold tracking-wider rounded-xl transition-colors">
            Search
          </button>
        </div>
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
          : paginated.length === 0
          ? (
              <div className="col-span-full flex flex-col items-center justify-center py-24 text-white/30">
                <span className="text-5xl mb-4">🔍</span>
                <h3 className="text-lg font-semibold text-white/50 mb-1">No movies found</h3>
                <p className="text-sm">Try a different keyword</p>
              </div>
            )
          : paginated.map((movie) => (
              <Link key={movie.id} href={`/movie/${movie.id}`}>
                <div className="group rounded-xl overflow-hidden bg-white/5 border border-white/[0.06] hover:border-red-500/40 hover:-translate-y-1.5 hover:shadow-2xl hover:shadow-black/60 transition-all duration-300 cursor-pointer">
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
              </Link>
            ))
        }
      </div>

      {/* Pagination dots */}
      {!loading && totalPages > 1 && (
        <div className="flex items-center justify-center gap-1.5 mt-10">
          {/* Prev */}
          <button
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-white/40 hover:text-white hover:bg-white/10 disabled:opacity-20 disabled:cursor-not-allowed transition-all text-sm">
            ‹
          </button>

          {getDots().map((dot, i) =>
            dot === "..." ? (
              <span key={`ellipsis-${i}`} className="w-8 h-8 flex items-center justify-center text-white/30 text-xs select-none">
                ···
              </span>
            ) : (
              <button
                key={dot}
                onClick={() => setCurrentPage(dot as number)}
                className={`w-8 h-8 flex items-center justify-center rounded-lg text-xs font-bold transition-all
                  ${currentPage === dot
                    ? "bg-red-600 text-white shadow-lg shadow-red-900/40"
                    : "text-white/40 hover:text-white hover:bg-white/10"
                  }`}>
                {dot}
              </button>
            )
          )}

          {/* Next */}
          <button
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-white/40 hover:text-white hover:bg-white/10 disabled:opacity-20 disabled:cursor-not-allowed transition-all text-sm">
            ›
          </button>
        </div>
      )}
    </>
  );
}