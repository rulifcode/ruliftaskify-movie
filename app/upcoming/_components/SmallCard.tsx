import { Movie, getTitle } from "@/types/movie";
import { RemindButton } from "./RemindButton";

const POSTER_BASE = "https://image.tmdb.org/t/p/w342";

interface SmallCardProps {
  item: Movie;
  isReminded: boolean;
  onToggle: (id: number) => void;
}

export function SmallCard({ item, isReminded, onToggle }: SmallCardProps) {
  const releaseDate = item.release_date ?? item.first_air_date ?? "";
  const displayDate = releaseDate
    ? new Date(releaseDate).toLocaleDateString("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "TBA";

  return (
    <div className="bg-[#0f1117] border border-white/[0.06] rounded-xl overflow-hidden hover:border-red-500/35 transition-all hover:-translate-y-0.5 cursor-pointer">
      {/* Poster */}
      <div className="aspect-[2/3] bg-[#14171f] flex items-center justify-center relative overflow-hidden">
        {item.poster_path ? (
          <img
            src={`${POSTER_BASE}${item.poster_path}`}
            alt={getTitle(item)}
            className="w-full h-full object-cover"
          />
        ) : (
          <span className="text-[9px] text-white/20 font-bold tracking-widest uppercase">
            {item.media_type ?? "movie"}
          </span>
        )}
        <div className="absolute bottom-0 inset-x-0 bg-[#080a0f]/85 px-2 py-1">
          <span className="text-[9px] font-black text-red-500 tracking-wider uppercase">
            {displayDate}
          </span>
        </div>
      </div>

      <div className="p-3">
        <p className="text-[12px] font-bold text-white truncate mb-1.5">
          {getTitle(item)}
        </p>

        <RemindButton
          id={item.id}
          isReminded={isReminded}
          onToggle={onToggle}
          size="sm"
        />
      </div>
    </div>
  );
}