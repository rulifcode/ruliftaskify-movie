import Link from "next/link";
import { Movie, MovieWithTrailer, getTitle, getReleaseYear } from "@/types/movie";

type TrailerSectionProps = {
  trailerMovies: MovieWithTrailer[];
  activeTrailer: MovieWithTrailer;
  onSelect: (movie: MovieWithTrailer) => void;
};

export default function TrailerSection({ trailerMovies, activeTrailer, onSelect }: TrailerSectionProps) {
  return (
    <div className="mb-16 mt-10">
      <div className="flex items-center gap-3 mb-6">
        <span className="w-1 h-5 bg-red-500 rounded-full block" />
        <h2 className="text-xl font-black tracking-wider uppercase">Trailers</h2>
      </div>

      <div className="flex gap-6 flex-col lg:flex-row">
        {/* Main player */}
        <div className="flex-1 min-w-0">
          <div className="relative w-full rounded-2xl overflow-hidden bg-black" style={{ aspectRatio: "16/9" }}>
            <iframe
              key={activeTrailer.trailerKey}
              src={`https://www.youtube.com/embed/${activeTrailer.trailerKey}?autoplay=1&mute=1&controls=1&rel=0&modestbranding=1`}
              title={getTitle(activeTrailer)}
              allow="autoplay; encrypted-media"
              allowFullScreen
              className="absolute inset-0 w-full h-full border-0"
            />
          </div>
          <div className="mt-3 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-base">{getTitle(activeTrailer)}</h3>
              <p className="text-xs text-white/40 mt-0.5">
                {getReleaseYear(activeTrailer)} · Official Trailer
              </p>
            </div>
            <Link
              href={`/movie/${activeTrailer.id}`}
              className="text-xs font-bold tracking-wider px-4 py-2 bg-red-600 hover:bg-red-500 rounded-lg transition-colors">
              View Details →
            </Link>
          </div>
        </div>

        {/* Playlist sidebar */}
        <div className="flex lg:flex-col gap-3 overflow-x-auto lg:overflow-x-visible lg:w-64 shrink-0 pb-2 lg:pb-0">
          {trailerMovies.map((m) => (
            <button
              key={m.id}
              onClick={() => onSelect(m)}
              className={`flex items-center gap-3 p-2.5 rounded-xl border transition-all text-left shrink-0 w-64 lg:w-auto ${
                activeTrailer.id === m.id
                  ? "border-red-500/60 bg-red-500/10"
                  : "border-white/[0.06] bg-white/5 hover:border-white/20"
              }`}
            >
              <div className="relative w-24 h-14 rounded-lg overflow-hidden shrink-0 bg-white/10">
                <img
                  src={`https://img.youtube.com/vi/${m.trailerKey}/mqdefault.jpg`}
                  alt={getTitle(m)}
                  className="w-full h-full object-cover"
                />
                {activeTrailer.id === m.id && (
                  <div className="absolute inset-0 bg-red-600/40 flex items-center justify-center">
                    <span className="text-white text-xs">▶</span>
                  </div>
                )}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-white line-clamp-2 leading-snug">{getTitle(m)}</p>
                <p className="text-[10px] text-white/40 mt-1">{getReleaseYear(m)}</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}