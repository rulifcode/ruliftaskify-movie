export type Movie = {
  id: number;
  title: string;
  poster_path: string;
  backdrop_path?: string;
  vote_average?: number;
  release_date?: string;
  overview?: string;
  genre_ids?: number[];
};

export type MovieWithTrailer = Movie & {
  trailerKey: string;
};