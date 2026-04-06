import Link from "next/link";

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

export default function MovieGrid({ movies, loading, query, onQueryChange, onSearch }: MovieGridProps) {
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
              onChange={e => onQueryChange(e.target.value)}
              onKeyDown={e => e.key === "Enter" && onSearch()}
              placeholder="Search movies..."
              className="w-64 h-10 bg-white/5 border border-white/10 rounded-xl pl-9 pr-4 text-sm text-white placeholder-white/30 outline-none focus:border-red-500/50 transition-all"
            />
          </div>
          <button
            onClick={onSearch}
            className="h-10 px-5 bg-red-600 hover:bg-red-500 text-white text-xs font-bold tracking-wider rounded-xl transition-colors">
            Search
          </button>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {loading
          ? Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="rounded-xl overflow-hidden bg-white/5 border border-white/[0.06] animate-pulse">
                <div className="aspect-[2/3] bg-white/10" />
                <div className="p-3 space-y-2">
                  <div className="h-3 bg-white/10 rounded w-4/5" />
                  <div className="h-2.5 bg-white/10 rounded w-1/2" />
                </div>
              </div>
            ))
          : movies.length === 0
          ? (
              <div className="col-span-full flex flex-col items-center justify-center py-24 text-white/30">
                <span className="text-5xl mb-4">🔍</span>
                <h3 className="text-lg font-semibold text-white/50 mb-1">No movies found</h3>
                <p className="text-sm">Try a different keyword</p>
              </div>
            )
          : movies.map((movie) => (
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
    </>
  );
}