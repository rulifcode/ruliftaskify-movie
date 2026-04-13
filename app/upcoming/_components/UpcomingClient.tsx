"use client";

import { useState, useMemo, useEffect } from "react";
import { Movie } from "@/types/movie";
import { getGenres } from "@/services/movieService";
import { FilterChips } from "./FilterChips";
import { SpotlightCard } from "./SpotlightCard";
import { SmallCard } from "./SmallCard";
import { useReminder } from "@/hooks/useReminder";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

interface Genre {
    id: number;
    name: string;
}

interface Props {
    movies: Movie[];
}

export function UpcomingClient({ movies }: Props) {
    const [activeFilter, setActiveFilter] = useState("Semua");
    const [genreMap, setGenreMap] = useState<Map<number, string>>(new Map());
    const [genreNames, setGenreNames] = useState<string[]>(["Semua"]);
    const { isReminded, toggleRemind } = useReminder();

    useEffect(() => {
        getGenres().then((data) => {
            const genres: Genre[] = data.genres ?? [];
            const map = new Map(genres.map((g) => [g.id, g.name]));
            setGenreMap(map);

            const usedIds = new Set(movies.flatMap((m) => m.genre_ids ?? []));
            const usedGenres = genres
                .filter((g) => usedIds.has(g.id))
                .map((g) => g.name);

            setGenreNames(["Semua", ...usedGenres]);
        });
    }, [movies]);

    const filtered = useMemo(() => {
        if (activeFilter === "Semua") return movies;

        const targetId = [...genreMap.entries()].find(
            ([, name]) => name === activeFilter
        )?.[0];

        if (!targetId) return movies;
        return movies.filter((m) => m.genre_ids?.includes(targetId));
    }, [movies, activeFilter, genreMap]);

    const spotlights = filtered.slice(0, 2);
    const rest = filtered.slice(2);

return (
  <>
  <div className="min-h-screen bg-[#080a0f]">
    <Header />
    
      <main className="py-10 px-6 lg:px-10">
        <div className="mb-8">
          <h1 className="text-2xl font-black tracking-widest uppercase text-white">
            Up<span className="text-red-500">coming</span>
          </h1>
          <p className="text-xs text-white/35 mt-1.5">
            Rilis terbaru yang akan segera hadir
          </p>
        </div>

        <FilterChips
          genres={genreNames}
          active={activeFilter}
          onChange={setActiveFilter}
        />

        {spotlights.length > 0 && (
          <>
            <p className="text-[10px] font-bold tracking-[.14em] uppercase text-white/22 mb-4">
              Paling Ditunggu
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
              {spotlights.map((item) => (
                <SpotlightCard
                  key={item.id}
                  item={item}
                  isReminded={isReminded(item.id)}
                  onToggle={toggleRemind}
                />
              ))}
            </div>
          </>
        )}

        {rest.length > 0 && (
          <>
            <p className="text-[10px] font-bold tracking-[.14em] uppercase text-white/22 mb-4">
              Bulan Ini
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {rest.map((item) => (
                <SmallCard
                  key={item.id}
                  item={item}
                  isReminded={isReminded(item.id)}
                  onToggle={toggleRemind}
                />
              ))}
            </div>
          </>
        )}

        {filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24">
            <p className="text-white/20 text-sm font-bold tracking-widest uppercase">
              Tidak ada film untuk genre ini
            </p>
          </div>
        )}
      </main>
    </div>
    <Footer />
  </>
);
}