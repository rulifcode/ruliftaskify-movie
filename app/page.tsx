"use client";

import { useEffect, useState, useCallback } from "react";
import {
  getPopularMovies,
  searchMovies,
  getPopularMoviesWithTrailers,
  getMoviesByGenre,
  getNowPlayingMovies,
  getTopRatedMovies, 
  getUpcomingMovies,
} from "@/services/movieService";
import { Movie, MovieWithTrailer } from "@/types/movie";
import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import TrailerSection from "@/components/TrailerSection";
import MovieGrid from "@/components/MovieGrid";
import TrendingSection from "@/components/TrendingSection";
import GenreFilter from "@/components/GenreFilter";
import MovieDetailModal from "@/components/MovieDetailModal";
import CarouselSection from "@/components/CarouselSection";  
import GridSection from "@/components/GridSection"; 
import Footer from "@/components/Footer";

export default function Home() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [trailerMovies, setTrailerMovies] = useState<MovieWithTrailer[]>([]);
  const [activeTrailer, setActiveTrailer] = useState<MovieWithTrailer | null>(null);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [heroIndex, setHeroIndex] = useState(0);
  const [fade, setFade] = useState(true);

  // ── Baru ──
  const [selectedGenreId, setSelectedGenreId] = useState<number | null>(null);
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);

  const fetchMovies = useCallback(async (q = query, genreId = selectedGenreId) => {
    setLoading(true);
    try {
      let data;
      if (q) {
        data = await searchMovies(q);
      } else if (genreId) {
        data = await getMoviesByGenre(genreId);
      } else {
        data = await getPopularMovies();
      }
      setMovies(data.results || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [query, selectedGenreId]);

  useEffect(() => {
    fetchMovies("", null);
    getPopularMoviesWithTrailers().then((data) => {
      setTrailerMovies(data);
      setActiveTrailer(data[0] ?? null);
    });
  }, []);

  // Genre change
  const handleGenreChange = (genreId: number | null) => {
    setSelectedGenreId(genreId);
    setQuery("");
    fetchMovies("", genreId);
  };

  // Auto-rotate hero
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
      <HeroSection heroMovies={heroMovies} heroIndex={heroIndex} fade={fade} onDotClick={handleDotClick} />

      <main className="relative z-10 max-w-[1400px] mx-auto px-10 pb-20">
        {activeTrailer && (
          <TrailerSection trailerMovies={trailerMovies} activeTrailer={activeTrailer} onSelect={setActiveTrailer} />
        )}

        {/* Trending */}
        <TrendingSection onMovieClick={setSelectedMovie} />

        {/* Now Playing — carousel */}
        <CarouselSection
          title="Now Playing"
          badge="In Theaters"
          fetchFn={getNowPlayingMovies}
          onMovieClick={setSelectedMovie}
        />

        {/* Genre Filter + Popular Grid */}
        <GenreFilter selectedGenreId={selectedGenreId} onChange={handleGenreChange} />
        <MovieGrid
          movies={movies}
          loading={loading}
          query={query}
          onQueryChange={setQuery}
          onSearch={() => fetchMovies()}
          onMovieClick={setSelectedMovie}
        />

        {/* Top Rated — grid */}
        <GridSection
          title="Top Rated"
          badge="All Time"
          fetchFn={getTopRatedMovies}
          onMovieClick={setSelectedMovie}
        />

        {/* Upcoming — grid */}
        <GridSection
          title="Upcoming"
          badge="Coming Soon"
          fetchFn={getUpcomingMovies}
          onMovieClick={setSelectedMovie}
        />
      </main>

      <MovieDetailModal movie={selectedMovie} onClose={() => setSelectedMovie(null)} />
        <Footer /> 
    </div>
  );
}