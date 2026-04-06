import { getMovieDetail } from "@/services/movieService";
import HeroSection from "@/components/HeroSection";

export default async function MovieDetail({ params }) {
  const { id } = await params;
  const movie = await getMovieDetail(id);

  if (!movie || movie.success === false) {
    return <div style={{ color: "white", padding: 40 }}>Movie not found.</div>;
  }

  return <HeroSection movie={movie} />;
}