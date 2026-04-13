"use client";

import { useState, useEffect, useRef } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import GridSection from "@/components/GridSection";
import MovieDetailModal from "@/components/MovieDetailModal";
import { Movie } from "@/types/movie";
import {
  getPopularMovies,
  getTopRatedMovies,
  getNowPlayingMovies,
  getUpcomingMovies,
} from "@/services/movieService";

const GENRES = [
  { id: 28, label: "Action" },
  { id: 35, label: "Comedy" },
  { id: 18, label: "Drama" },
  { id: 27, label: "Horror" },
  { id: 878, label: "Sci-Fi" },
  { id: 10749, label: "Romance" },
  { id: 53, label: "Thriller" },
  { id: 16, label: "Animation" },
];

const SORT_OPTIONS = [
  {
    value: "popular",
    label: "Most Popular",
    badge: "HOT",
    badgeColor: "text-red-400 bg-red-500/10",
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
      </svg>
    ),
  },
  {
    value: "top_rated",
    label: "Top Rated",
    badge: null,
    badgeColor: "",
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
      </svg>
    ),
  },
  {
    value: "now_playing",
    label: "Now Playing",
    badge: "LIVE",
    badgeColor: "text-green-400 bg-green-500/10",
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10" />
        <polygon points="10 8 16 12 10 16 10 8" />
      </svg>
    ),
  },
  {
    value: "upcoming",
    label: "Upcoming",
    badge: null,
    badgeColor: "",
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="3" y="4" width="18" height="18" rx="2" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
      </svg>
    ),
  },
];

/* ─────────────────────────────────────────────
   FilterIcon – hamburger used on mobile toolbar
───────────────────────────────────────────── */
function FilterIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="4" y1="6" x2="20" y2="6" />
      <line x1="8" y1="12" x2="20" y2="12" />
      <line x1="12" y1="18" x2="20" y2="18" />
    </svg>
  );
}

/* ─────────────────────────────────────────────
   SidebarContent – shared between desktop sidebar & mobile sheet
───────────────────────────────────────────── */
function SidebarContent({
  activeSort,
  setActiveSort,
  activeGenres,
  toggleGenre,
  setActiveGenres,
  onClose,
}: {
  activeSort: string;
  setActiveSort: (v: string) => void;
  activeGenres: number[];
  toggleGenre: (id: number) => void;
  setActiveGenres: (g: number[]) => void;
  onClose?: () => void;
}) {
  return (
    <div className="flex flex-col h-full">
      {/* Sort Section */}
      <div className="pt-5 pb-2">
        <p className="text-[9px] font-bold tracking-[0.14em] uppercase text-white/20 px-5 mb-2">
          Urutkan
        </p>
        {SORT_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            onClick={() => {
              setActiveSort(opt.value);
              onClose?.();
            }}
            className={`w-full flex items-center gap-2.5 px-5 py-2.5 text-[12.5px] font-medium transition-all relative
              ${activeSort === opt.value
                ? "text-white bg-red-600/10 before:absolute before:left-0 before:top-0 before:bottom-0 before:w-[3px] before:bg-red-600 before:rounded-r-sm"
                : "text-white/40 hover:text-white/70 hover:bg-white/[0.03]"
              }`}
          >
            <span className={activeSort === opt.value ? "opacity-100" : "opacity-60"}>
              {opt.icon}
            </span>
            {opt.label}
            {opt.badge && (
              <span className={`ml-auto text-[9px] font-bold px-1.5 py-0.5 rounded-full ${opt.badgeColor}`}>
                {opt.badge}
              </span>
            )}
          </button>
        ))}
      </div>

      <div className="mx-5 my-1 h-px bg-white/[0.05]" />

      {/* Genre Section */}
      <div className="pt-3 pb-2">
        <div className="flex items-center justify-between px-5 mb-3">
          <p className="text-[9px] font-bold tracking-[0.14em] uppercase text-white/20">
            Genre
          </p>
          {activeGenres.length > 0 && (
            <button
              onClick={() => setActiveGenres([])}
              className="text-[9px] text-white/25 hover:text-white/50 transition-colors"
            >
              Clear ✕
            </button>
          )}
        </div>
        <div className="px-4 flex flex-wrap gap-1.5">
          {GENRES.map((g) => (
            <button
              key={g.id}
              onClick={() => toggleGenre(g.id)}
              className={`text-[10.5px] font-medium px-2.5 py-1 rounded-full border transition-all ${
                activeGenres.includes(g.id)
                  ? "bg-red-600/15 border-red-500/50 text-red-400 font-semibold"
                  : "border-white/10 text-white/35 hover:border-white/25 hover:text-white/60"
              }`}
            >
              {g.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mx-5 my-1 h-px bg-white/[0.05]" />

      {/* Library Section */}
      <div className="pt-3 pb-4">
        <p className="text-[9px] font-bold tracking-[0.14em] uppercase text-white/20 px-5 mb-2">
          Library
        </p>
        {[
          {
            label: "Watchlist",
            badge: "12",
            icon: (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
              </svg>
            ),
          },
          {
            label: "Continue Watching",
            badge: null,
            icon: (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
            ),
          },
        ].map((item) => (
          <button
            key={item.label}
            className="w-full flex items-center gap-2.5 px-5 py-2.5 text-[12.5px] font-medium text-white/40 hover:text-white/70 hover:bg-white/[0.03] transition-all"
          >
            <span className="opacity-60">{item.icon}</span>
            {item.label}
            {item.badge && (
              <span className="ml-auto text-[9px] font-bold px-1.5 py-0.5 rounded-full text-red-400 bg-red-500/10">
                {item.badge}
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   MobileFilterSheet – bottom sheet for mobile
───────────────────────────────────────────── */
function MobileFilterSheet({
  open,
  onClose,
  ...props
}: {
  open: boolean;
  onClose: () => void;
  activeSort: string;
  setActiveSort: (v: string) => void;
  activeGenres: number[];
  toggleGenre: (id: number) => void;
  setActiveGenres: (g: number[]) => void;
}) {
  // Lock body scroll when open
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      {/* Sheet */}
      <div
        className={`fixed bottom-0 left-0 right-0 z-50 bg-[#0d1017] border-t border-white/10 rounded-t-2xl overflow-y-auto max-h-[80dvh]
          transition-transform duration-300 ease-out ${open ? "translate-y-0" : "translate-y-full"}`}
      >
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-white/20" />
        </div>
        <SidebarContent {...props} onClose={onClose} />
        {/* Bottom safe area */}
        <div className="h-6" />
      </div>
    </>
  );
}

/* ─────────────────────────────────────────────
   Main Page
───────────────────────────────────────────── */
export default function MoviesPage() {
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [activeGenres, setActiveGenres] = useState<number[]>([]);
  const [activeSort, setActiveSort] = useState("popular");
  const [searchQuery, setSearchQuery] = useState("");
  const [inputValue, setInputValue] = useState("");
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  const toggleGenre = (id: number) => {
    setActiveGenres((prev) =>
      prev.includes(id) ? prev.filter((g) => g !== id) : [...prev, id]
    );
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchQuery(inputValue.trim());
  };

  const handleClearSearch = () => {
    setInputValue("");
    setSearchQuery("");
  };

  const fetchFnMap: Record<string, () => Promise<{ results: Movie[] }>> = {
    popular: getPopularMovies,
    top_rated: getTopRatedMovies,
    now_playing: getNowPlayingMovies,
    upcoming: getUpcomingMovies,
  };

  const currentSort = SORT_OPTIONS.find((s) => s.value === activeSort)!;
  const activeFilterCount = activeGenres.length;

  return (
    <div className="flex flex-col min-h-screen bg-[#080a0f] text-white">

      {/* ── HEADER ── */}
      <Header />

      {/* ── BODY ── */}
      <div className="flex flex-1 mt-0">

        {/* ── DESKTOP SIDEBAR (hidden on mobile/tablet) ── */}
        <aside className="hidden lg:flex w-52 shrink-0 sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto border-r border-white/[0.06] bg-[#0d1017] flex-col">
          <SidebarContent
            activeSort={activeSort}
            setActiveSort={setActiveSort}
            activeGenres={activeGenres}
            toggleGenre={toggleGenre}
            setActiveGenres={setActiveGenres}
          />
        </aside>

        {/* ── CONTENT ── */}
        <div className="flex flex-col flex-1 min-w-0">
          <div className="flex-1 px-4 sm:px-6 lg:px-8 py-5 sm:py-8">

            {/* Page heading + Search */}
            <div className="flex flex-col gap-4 mb-6 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-[10px] font-mono text-red-400 tracking-widest uppercase mb-1">
                  Browse
                </p>
                <h1 className="text-2xl sm:text-3xl font-black tracking-tight leading-none">
                  {searchQuery ? `"${searchQuery}"` : currentSort.label}
                </h1>
                <p className="text-white/35 text-sm mt-1">
                  {searchQuery
                    ? "Showing results for your search"
                    : "Discover the latest and greatest films from around the world."}
                </p>
              </div>

              {/* Search + mobile filter button row */}
              <div className="flex items-center gap-2 w-full sm:w-auto">

                {/* Mobile: Filter button (visible < lg) */}
                <button
                  onClick={() => setMobileFilterOpen(true)}
                  className="lg:hidden relative flex items-center gap-2 px-3 py-2 rounded-lg bg-white/[0.06] border border-white/10 text-sm text-white/60 hover:text-white hover:bg-white/[0.09] transition-all shrink-0"
                >
                  <FilterIcon />
                  <span className="text-xs font-medium hidden sm:inline">Filters</span>
                  {activeFilterCount > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 w-4 h-4 flex items-center justify-center text-[9px] font-bold rounded-full bg-red-600 text-white">
                      {activeFilterCount}
                    </span>
                  )}
                </button>

                {/* Search Form */}
                <form onSubmit={handleSearch} className="flex items-center gap-2 flex-1 sm:flex-none">
                  <div className="relative flex-1 sm:flex-none">
                    <svg
                      className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/30 pointer-events-none"
                      fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"
                    >
                      <circle cx="11" cy="11" r="8" />
                      <path d="m21 21-4.35-4.35" />
                    </svg>
                    <input
                      type="text"
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      placeholder="Search movies..."
                      className="w-full sm:w-52 md:w-64 pl-9 pr-8 py-2 rounded-lg bg-white/[0.06] border border-white/10 text-sm text-white placeholder:text-white/25 focus:outline-none focus:border-red-500/50 focus:bg-white/[0.08] transition-all"
                    />
                    {inputValue && (
                      <button
                        type="button"
                        onClick={handleClearSearch}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-white/25 hover:text-white/60 transition-colors"
                      >
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <path d="M18 6 6 18M6 6l12 12" />
                        </svg>
                      </button>
                    )}
                  </div>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-xs font-bold tracking-wide transition-colors shrink-0"
                  >
                    Search
                  </button>
                </form>
              </div>
            </div>

            {/* Active filters pill strip (mobile/tablet) */}
            {(activeGenres.length > 0 || activeSort !== "popular") && (
              <div className="lg:hidden flex flex-wrap gap-1.5 mb-5">
                {/* Sort pill */}
                {activeSort !== "popular" && (
                  <span className="inline-flex items-center gap-1 text-[10.5px] px-2.5 py-1 rounded-full bg-white/[0.07] border border-white/10 text-white/60">
                    {currentSort.label}
                  </span>
                )}
                {/* Genre pills */}
                {activeGenres.map((id) => {
                  const g = GENRES.find((x) => x.id === id)!;
                  return (
                    <button
                      key={id}
                      onClick={() => toggleGenre(id)}
                      className="inline-flex items-center gap-1 text-[10.5px] px-2.5 py-1 rounded-full bg-red-600/15 border border-red-500/40 text-red-400"
                    >
                      {g.label}
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="M18 6 6 18M6 6l12 12" />
                      </svg>
                    </button>
                  );
                })}
                {activeGenres.length > 0 && (
                  <button
                    onClick={() => setActiveGenres([])}
                    className="text-[10px] text-white/25 hover:text-white/50 px-1 transition-colors"
                  >
                    Clear all
                  </button>
                )}
              </div>
            )}

            <GridSection
              key={`${activeSort}-${searchQuery}`}
              title={currentSort.label}
              badge="Movies"
              fetchFn={fetchFnMap[activeSort]}
              onMovieClick={setSelectedMovie}
              activeGenres={activeGenres}
              searchQuery={searchQuery}
            />
          </div>

          {/* ── FOOTER ── */}
          <Footer />
        </div>
      </div>

      {/* ── MOBILE BOTTOM SHEET FILTER ── */}
      <MobileFilterSheet
        open={mobileFilterOpen}
        onClose={() => setMobileFilterOpen(false)}
        activeSort={activeSort}
        setActiveSort={setActiveSort}
        activeGenres={activeGenres}
        toggleGenre={toggleGenre}
        setActiveGenres={setActiveGenres}
      />

      {/* Modal */}
      {selectedMovie && (
        <MovieDetailModal
          movie={selectedMovie}
          onClose={() => setSelectedMovie(null)}
        />
      )}
    </div>
  );
}