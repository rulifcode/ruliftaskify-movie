import { getMovieDetail } from "@/services/movieService";
import MovieDetailHero from "@/components/MovieDetailHero";
import Header from "@/components/Header";

export default async function MovieDetail({ params }) {
  const { id } = params;
  const movie = await getMovieDetail(id);

  if (!movie || movie.success === false) {
    return (
      <div className="min-h-screen bg-[#080a0f] flex items-center justify-center">
        <p className="text-white/50 text-lg">Movie not found.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#080a0f]">
      <Header />
      <MovieDetailHero movie={movie} />
    </div>
  );
}