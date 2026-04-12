export type Movie = {
  id: number;
  title?: string;       // ← jadikan optional karena series tidak punya title
  name?: string;        // ← tambah untuk series
  poster_path: string;
  backdrop_path?: string;
  vote_average?: number;
  media_type?: "movie" | "tv";
  release_date?: string;
  first_air_date?: string; // ← tambah untuk series
  overview?: string;
  genre_ids?: number[];
};

export type MovieWithTrailer = Movie & {
  trailerKey: string;
};