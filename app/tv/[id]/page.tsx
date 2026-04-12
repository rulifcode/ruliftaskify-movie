// app/tv/[id]/page.tsx
import { getSeriesDetails } from "@/services/seriesService";
import TvDetailHero from "@/components/TvDetailHero";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function TvPage({ params }: Props) {
  const { id } = await params;

  let series = null;
  try {
    series = await getSeriesDetails(Number(id));
  } catch {
    series = null;
  }

  if (!series) {
    return (
      <div className="min-h-screen bg-[#080a0f] flex items-center justify-center">
        <p className="text-white/50 text-lg">Series not found.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#080a0f]">
      <Header />
      <TvDetailHero series={series} />
      <Footer />
    </div>
  );
}