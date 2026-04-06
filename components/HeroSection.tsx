type Movie = {
  id: number;
  title: string;
  poster_path: string;
  backdrop_path?: string;
  vote_average?: number;
  release_date?: string;
};

type HeroSectionProps = {
  heroMovies: Movie[];
  heroIndex: number;
  fade: boolean;
  onDotClick: (i: number) => void;
};

export default function HeroSection({ heroMovies, heroIndex, fade, onDotClick }: HeroSectionProps) {
  const currentHero = heroMovies[heroIndex];

  return (
    <div className="relative w-full overflow-hidden" style={{ height: "520px" }}>

      {/* Backdrop */}
      {currentHero?.backdrop_path && (
        <img
          key={currentHero.id}
          src={`https://image.tmdb.org/t/p/original${currentHero.backdrop_path}`}
          alt=""
          aria-hidden
          className="absolute inset-0 w-full h-full object-cover object-top"
          style={{ opacity: fade ? 0.45 : 0, transition: "opacity 0.6s ease" }}
        />
      )}

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#080a0f] via-[#080a0f]/70 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#080a0f] via-transparent to-[#080a0f]/30" />

      {/* Content */}
      <div className="relative z-10 h-full max-w-[1400px] mx-auto px-10 flex flex-col justify-center">
        <div style={{ opacity: fade ? 1 : 0, transition: "opacity 0.6s ease" }}>
          <div className="flex items-center gap-1.5 text-[10px] font-bold tracking-[0.15em] uppercase text-red-500 mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
            Now Streaming
          </div>

          <h1 className="text-7xl font-black tracking-tight leading-none uppercase mb-5">
            Discover<br />
            <span className="text-red-500">Great Films</span>
          </h1>

          <p className="text-sm text-white/50 max-w-md leading-relaxed mb-4">
            Jelajahi ribuan film populer, temukan trailer terbaru, dan simpan favoritmu — semuanya dalam satu tempat.
          </p>

          {currentHero && (
            <p className="text-sm text-white/40 font-medium tracking-wide">
              Featured: <span className="text-white/70">{currentHero.title}</span>
              {currentHero.vote_average && (
                <span className="ml-3 text-yellow-400">★ {currentHero.vote_average.toFixed(1)}</span>
              )}
            </p>
          )}
        </div>

        {/* Dot indicators */}
        {heroMovies.length > 0 && (
          <div className="flex items-center gap-2 mt-8">
            {heroMovies.slice(0, 8).map((_, i) => (
              <button
                key={i}
                onClick={() => onDotClick(i)}
                className={`rounded-full transition-all duration-300 ${i === heroIndex ? "w-6 h-1.5 bg-red-500" : "w-1.5 h-1.5 bg-white/30 hover:bg-white/60"}`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}