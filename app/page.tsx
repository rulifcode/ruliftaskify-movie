"use client";

import { useEffect, useState } from "react";
import { getPopularMovies, searchMovies, getPopularMoviesWithTrailers } from "@/services/movieService";
import { Movie, MovieWithTrailer } from "@/types/movie";
import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import TrailerSection from "@/components/TrailerSection";
import MovieGrid from "@/components/MovieGrid";

export default function Home() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [trailerMovies, setTrailerMovies] = useState<MovieWithTrailer[]>([]);
  const [activeTrailer, setActiveTrailer] = useState<MovieWithTrailer | null>(null);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [heroIndex, setHeroIndex] = useState(0);
  const [fade, setFade] = useState(true);

  const fetchMovies = async (q = query) => {
    setLoading(true);
    try {
      const data = q ? await searchMovies(q) : await getPopularMovies();
      setMovies(data.results || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMovies("");
    getPopularMoviesWithTrailers().then((data) => {
      setTrailerMovies(data);
      setActiveTrailer(data[0] ?? null);
    });
  }, []);

  // Auto-rotate hero backdrop setiap 5 detik
  const heroMovies = movies.filter((m) => m.backdrop_path);
  useEffect(() => {
    if (heroMovies.length === 0) return;
    const interval = setInterval(() => {
      setFade(false);
      setTimeout(() => {
        setHeroIndex((prev) => (prev + 1) % heroMovies.length);
        setFade(true);
      }, 500);
    }, 5000);
    return () => clearInterval(interval);
  }, [heroMovies.length]);

  const handleDotClick = (i: number) => {
    setFade(false);
    setTimeout(() => {
      setHeroIndex(i);
      setFade(true);
    }, 300);
  };

  return (
    <div className="min-h-screen bg-[#080a0f] text-white font-sans">
      <Header />

      <HeroSection
        heroMovies={heroMovies}
        heroIndex={heroIndex}
        fade={fade}
        onDotClick={handleDotClick}
      />

      <main className="relative z-10 max-w-[1400px] mx-auto px-10 pb-20">
        {activeTrailer && (
          <TrailerSection
            trailerMovies={trailerMovies}
            activeTrailer={activeTrailer}
            onSelect={setActiveTrailer}
          />
        )}

        <MovieGrid
          movies={movies}
          loading={loading}
          query={query}
          onQueryChange={setQuery}
          onSearch={() => fetchMovies()}
        />
      </main>
    </div>
  );
}