export type Movie = {
  id: number;
  title?: string;
  name?: string;
  poster_path: string;
  backdrop_path?: string;
  vote_average?: number;
  media_type?: "movie" | "tv";
  release_date?: string;
  first_air_date?: string;
  overview?: string;
  genre_ids?: number[];
};

export function getTitle(movie: Movie): string {
  return movie.title ?? movie.name ?? "Untitled";
}

export function getReleaseYear(movie: Movie): string {
  const date = movie.release_date ?? movie.first_air_date;
  return date ? date.slice(0, 4) : "";
}

export type MovieWithTrailer = Movie & {
  trailerKey: string;
};