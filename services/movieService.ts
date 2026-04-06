const API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY;

export const getPopularMovies = async () => {
  const res = await fetch(
    `https://api.themoviedb.org/3/movie/popular?api_key=${API_KEY}`
  );
  return res.json();
};

export const searchMovies = async (query: string) => {
  const res = await fetch(
    `https://api.themoviedb.org/3/search/movie?api_key=${API_KEY}&query=${query}`
  );
  return res.json();
};

export const getMovieDetail = async (id: string) => {
  const res = await fetch(
    `https://api.themoviedb.org/3/movie/${id}?api_key=${API_KEY}&append_to_response=credits,images,videos&include_image_language=en,null`
  );
  return res.json();
};

export const getPopularMoviesWithTrailers = async () => {
  const res = await fetch(
    `https://api.themoviedb.org/3/movie/popular?api_key=${API_KEY}`
  );
  const data = await res.json();

  // Fetch videos untuk masing-masing movie (ambil 5 pertama aja biar ga banyak request)
  const moviesWithTrailers = await Promise.all(
    data.results.slice(0, 5).map(async (movie: { id: number }) => {
      const videoRes = await fetch(
        `https://api.themoviedb.org/3/movie/${movie.id}/videos?api_key=${API_KEY}`
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