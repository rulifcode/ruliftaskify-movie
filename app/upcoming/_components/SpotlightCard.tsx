import { Movie, getTitle } from "@/types/movie";
import { Countdown } from "./Countdown";
import { RemindButton } from "./RemindButton";

const POSTER_BASE = "https://image.tmdb.org/t/p/w500";

interface SpotlightCardProps {
  item: Movie;
  isReminded: boolean;
  onToggle: (id: number) => void;
}

export function SpotlightCard({ item, isReminded, onToggle }: SpotlightCardProps) {
  const releaseDate = item.release_date ?? item.first_air_date ?? "";
  const displayDate = releaseDate
    ? new Date(releaseDate).toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "TBA";

  return (
    <div className="bg-[#0f1117] border border-white/[0.07] rounded-2xl overflow-hidden hover:border-red-500/40 transition-all hover:-translate-y-0.5">
      {/* Poster */}
      <div className="h-36 bg-[#1a1d25] flex items-center justify-center relative overflow-hidden">
        {item.backdrop_path ? (
          <img
            src={`${POSTER_BASE}${item.backdrop_path}`}
            alt={getTitle(item)}
            className="w-full h-full object-cover opacity-60"
          />
        ) : (
          <span className="text-xs font-bold text-white/30 tracking-widest uppercase">
            {item.media_type ?? "movie"}
          </span>
        )}
        <span className="absolute top-2 left-2 text-[9px] font-black bg-red-500/90 text-white px-2 py-0.5 rounded">
          {displayDate.split(" ").slice(0, 2).join(" ")}
        </span>
      </div>

      <div className="p-4 flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold text-red-500 tracking-wider uppercase">
            {displayDate}
          </span>
          <span className="text-[9px] font-bold tracking-widest text-white/30 uppercase bg-white/[0.06] px-2 py-0.5 rounded">
            {item.media_type ?? "movie"}
          </span>
        </div>

        <h2 className="text-[15px] font-black text-white">{getTitle(item)}</h2>

        <p className="text-[11px] text-white/38 leading-relaxed line-clamp-2">
          {item.overview ?? "-"}
        </p>

        <div className="flex items-center justify-between mt-1">
          {releaseDate && <Countdown targetDate={releaseDate} />}
          <RemindButton id={item.id} isReminded={isReminded} onToggle={onToggle} />
        </div>
      </div>
    </div>
  );
}