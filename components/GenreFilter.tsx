"use client";

import { useEffect, useState } from "react";
import { getGenres } from "@/services/movieService";

type Genre = { id: number; name: string };

type Props = {
  selectedGenreId: number | null;
  onChange: (genreId: number | null) => void;
};

export default function GenreFilter({ selectedGenreId, onChange }: Props) {
  const [genres, setGenres] = useState<Genre[]>([]);

  useEffect(() => {
    getGenres().then((data) => setGenres(data.genres ?? []));
  }, []);

  if (genres.length === 0) return null;

  const all = [{ id: 0, name: "All" }, ...genres];

  return (
    <div className="mb-6">
      <div
        className="flex gap-2 overflow-x-auto pb-2"
        style={{ scrollbarWidth: "none" }}
      >
        {all.map((genre) => {
          const isActive =
            genre.id === 0
              ? selectedGenreId === null
              : selectedGenreId === genre.id;

          return (
            <button
              key={genre.id}
              onClick={() => onChange(genre.id === 0 ? null : genre.id)}
              className="relative flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200"
              style={{
                background: isActive
                  ? "rgba(239,68,68,0.15)"
                  : "rgba(255,255,255,0.05)",
                color: isActive ? "#f87171" : "rgba(255,255,255,0.45)",
                border: isActive
                  ? "1px solid rgba(239,68,68,0.4)"
                  : "1px solid rgba(255,255,255,0.08)",
                transform: isActive ? "scale(1.03)" : "scale(1)",
              }}
            >
              {isActive && (
                <span
                  className="absolute inset-0 rounded-full"
                  style={{
                    background:
                      "radial-gradient(ellipse at 50% 0%, rgba(239,68,68,0.15) 0%, transparent 70%)",
                  }}
                />
              )}
              <span className="relative">{genre.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}