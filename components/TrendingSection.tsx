"use client";

import { useEffect, useRef, useState } from "react";
import { getTrendingMovies } from "@/services/movieService";
import { Movie } from "@/types/movie";

type Props = {
  onMovieClick?: (movie: Movie) => void;
};

export default function TrendingSection({ onMovieClick }: Props) {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const rowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    getTrendingMovies().then((data) => setMovies(data.results?.slice(0, 12) ?? []));
  }, []);

  const onMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setStartX(e.pageX - (rowRef.current?.offsetLeft ?? 0));
    setScrollLeft(rowRef.current?.scrollLeft ?? 0);
  };

  const onMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !rowRef.current) return;
    e.preventDefault();
    const x = e.pageX - rowRef.current.offsetLeft;
    rowRef.current.scrollLeft = scrollLeft - (x - startX);
  };

  const stopDrag = () => setIsDragging(false);

  if (movies.length === 0) return null;

  return (
    <section className="mb-14">
      {/* Header */}
      <div className="flex items-center gap-3 mb-5">
        <div className="flex items-center gap-2">
          <span className="inline-block w-1 h-5 rounded-full bg-red-500" />
          <h2 className="text-white text-lg font-semibold tracking-wide">
            Trending This Week
          </h2>
        </div>
        <div className="flex-1 h-px bg-white/5" />
        <span className="text-white/30 text-xs font-mono uppercase tracking-widest">
          #{movies.length} titles
        </span>
      </div>

      {/* Scrollable Row */}
      <div
        ref={rowRef}
        className="flex gap-4 overflow-x-auto pb-4 cursor-grab active:cursor-grabbing select-none"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={stopDrag}
        onMouseLeave={stopDrag}
      >
        {movies.map((movie, i) => (
          <TrendingCard
            key={movie.id}
            movie={movie}
            rank={i + 1}
            onClick={() => onMovieClick?.(movie)}
          />
        ))}
      </div>
    </section>
  );
}

function TrendingCard({
  movie,
  rank,
  onClick,
}: {
  movie: Movie;
  rank: number;
  onClick: () => void;
}) {
  const [hovered, setHovered] = useState(false);
  const img = movie.poster_path
    ? `https://image.tmdb.org/t/p/w342${movie.poster_path}`
    : null;

  const rating = movie.vote_average ?? 0;
  const ratingColor =
    rating >= 7.5
      ? "text-emerald-400"
      : rating >= 6
      ? "text-yellow-400"
      : "text-red-400";

  return (
    <div
      className="relative flex-shrink-0 group"
      style={{ width: 150 }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={onClick}
    >
      {/* Rank Number */}
      <div
        className="absolute -left-3 bottom-12 z-10 font-black text-white/10 pointer-events-none leading-none select-none"
        style={{ fontSize: 72, lineHeight: 1, WebkitTextStroke: "1px rgba(255,255,255,0.12)" }}
      >
        {rank}
      </div>

      {/* Poster */}
      <div
        className="relative rounded-xl overflow-hidden cursor-pointer"
        style={{
          height: 210,
          transform: hovered ? "scale(1.04) translateY(-4px)" : "scale(1)",
          transition: "transform 0.3s ease",
          boxShadow: hovered
            ? "0 20px 40px rgba(0,0,0,0.6)"
            : "0 4px 12px rgba(0,0,0,0.4)",
        }}
      >
        {img ? (
          <img
            src={img}
            alt={movie.title}
            className="w-full h-full object-cover"
            draggable={false}
          />
        ) : (
          <div className="w-full h-full bg-white/5 flex items-center justify-center">
            <span className="text-white/20 text-xs">No Image</span>
          </div>
        )}

        {/* Hover Overlay */}
        <div
          className="absolute inset-0 flex items-center justify-center"
          style={{
            background: "rgba(0,0,0,0.55)",
            opacity: hovered ? 1 : 0,
            transition: "opacity 0.25s ease",
          }}
        >
          <div className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center">
            <svg className="w-4 h-4 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
        </div>
      </div>

      {/* Info */}
      <div className="mt-2.5 px-0.5">
        <p className="text-white/85 text-xs font-medium leading-tight line-clamp-2 mb-1">
          {movie.title}
        </p>
        <div className="flex items-center gap-1.5">
          <svg className="w-3 h-3 text-yellow-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
          <span className={`text-xs font-semibold ${ratingColor}`}>
            {rating.toFixed(1)}
          </span>
          {movie.release_date && (
            <span className="text-white/25 text-xs">
              · {movie.release_date.slice(0, 4)}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}