// services/seriesService.ts
// Mirrors movieService.ts but for TV series (TMDB /tv endpoints)

const API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY;
const BASE_URL = "https://api.themoviedb.org/3";

export interface Season {
  id: number;
  name: string;
  season_number: number;
  episode_count: number;
  air_date: string | null;
  poster_path: string | null;
  overview: string;
}

export interface Episode {
  id: number;
  name: string;
  overview: string;
  episode_number: number;
  season_number: number;
  air_date: string;
  runtime: number | null;
  vote_average: number;
  still_path: string | null;
}

export interface SeriesDetails {
  id: number;
  name: string;
  overview: string;
  first_air_date: string;
  last_air_date: string;
  status: string;
  type: string;
  number_of_seasons: number;
  number_of_episodes: number;
  seasons: Season[];
  genres: { id: number; name: string }[];
  networks: { id: number; name: string; logo_path: string | null }[];
  created_by: { id: number; name: string }[];
  spoken_languages: { name: string; iso_639_1: string }[];
}

async function fetchTMDB<T>(path: string, params = ""): Promise<T> {
  const res = await fetch(
    `${BASE_URL}${path}?api_key=${API_KEY}&language=en-US${params}`
  );
  if (!res.ok) throw new Error(`TMDB error ${res.status} on ${path}`);
  return res.json() as Promise<T>;
}

// ── List endpoints ──────────────────────────────────────────────────────────

export const getPopularSeries = () =>
  fetchTMDB<{ results: any[] }>("/tv/popular");

export const getTopRatedSeries = () =>
  fetchTMDB<{ results: any[] }>("/tv/top_rated");

export const getOnAirSeries = () =>
  fetchTMDB<{ results: any[] }>("/tv/on_the_air");

export const getUpcomingSeries = () =>
  fetchTMDB<{ results: any[] }>("/tv/airing_today");

export const searchSeries = (query: string) =>
  fetchTMDB<{ results: any[] }>("/search/tv", `&query=${encodeURIComponent(query)}`);

// ── Detail endpoints ─────────────────────────────────────────────────────────

export const getSeriesDetails = (id: number) =>
  fetchTMDB<SeriesDetails>(`/tv/${id}`);

export const getSeasonEpisodes = async (
  seriesId: number,
  seasonNumber: number
): Promise<Episode[]> => {
  const data = await fetchTMDB<{ episodes: Episode[] }>(
    `/tv/${seriesId}/season/${seasonNumber}`
  );
  return data.episodes ?? [];
};