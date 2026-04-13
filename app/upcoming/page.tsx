import { getUpcomingMovies } from "@/services/movieService";
import { UpcomingClient } from "./_components/UpcomingClient";

export default async function UpcomingPage() {
  const data = await getUpcomingMovies();
  const movies = data.results ?? [];

  return <UpcomingClient movies={movies} />;
}