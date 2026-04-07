const API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY;
const BASE = "https://api.themoviedb.org/3";

export const getPopularMovies = async () => {
  const res = await fetch(`${BASE}/movie/popular?api_key=${API_KEY}`);
  return res.json();
};

export const searchMovies = async (query: string) => {
  const res = await fetch(
    `${BASE}/search/movie?api_key=${API_KEY}&query=${query}`
  );
  return res.json();
};

export const getMovieDetail = async (id: string) => {
  const res = await fetch(
    `${BASE}/movie/${id}?api_key=${API_KEY}&append_to_response=credits,images,videos&include_image_language=en,null`
  );
  return res.json();
};

export const getPopularMoviesWithTrailers = async () => {
  const res = await fetch(`${BASE}/movie/popular?api_key=${API_KEY}`);
  const data = await res.json();

  const moviesWithTrailers = await Promise.all(
    data.results.slice(0, 5).map(async (movie: { id: number }) => {
      const videoRes = await fetch(
        `${BASE}/movie/${movie.id}/videos?api_key=${API_KEY}`
      );
      const videoData = await videoRes.json();
      const trailer = videoData.results?.find(
        (v: { type: string; site: string }) =>
          v.type === "Trailer" && v.site === "YouTube"
      );
      return { ...movie, trailerKey: trailer?.key ?? null };
    })
  );

  return moviesWithTrailers.filter((m) => m.trailerKey);
};

// ── Baru ────────────────────────────────────────────────────────────────────

export const getTrendingMovies = async () => {
  const res = await fetch(`${BASE}/trending/movie/week?api_key=${API_KEY}`);
  return res.json();
};

export const getGenres = async () => {
  const res = await fetch(
    `${BASE}/genre/movie/list?api_key=${API_KEY}&language=en-US`
  );
  return res.json();
};

export const getMoviesByGenre = async (genreId: number) => {
  const res = await fetch(
    `${BASE}/discover/movie?api_key=${API_KEY}&with_genres=${genreId}&sort_by=popularity.desc`
  );
  return res.json();
};

export const getMovieDetailFull = async (id: number) => {
  const res = await fetch(
    `${BASE}/movie/${id}?api_key=${API_KEY}&append_to_response=credits,videos`
  );
  return res.json();
};

export const searchMoviesSuggestions = async (query: string) => {
  const res = await fetch(
    `${BASE}/search/movie?api_key=${API_KEY}&query=${encodeURIComponent(query)}&page=1`
  );
  return res.json();
};

export const getTopRatedMovies = async () => {
  const res = await fetch(`${BASE}/movie/top_rated?api_key=${API_KEY}`);
  return res.json();
};

export const getUpcomingMovies = async () => {
  const res = await fetch(`${BASE}/movie/upcoming?api_key=${API_KEY}`);
  return res.json();
};

export const getNowPlayingMovies = async () => {
  const res = await fetch(`${BASE}/movie/now_playing?api_key=${API_KEY}`);
  return res.json();
};