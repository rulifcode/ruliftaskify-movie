"use client";

interface FilterChipsProps {
  genres: readonly string[];
  active: string;
  onChange: (genre: string) => void;
}

export function FilterChips({ genres, active, onChange }: FilterChipsProps) {
  return (
    <div className="flex flex-wrap gap-2 mb-8">
      {genres.map((g) => (
        <button
          key={g}
          onClick={() => onChange(g)}
          className={`px-4 py-1.5 rounded-full text-[11px] font-bold tracking-widest uppercase border transition-all ${
            active === g
              ? "bg-red-600 border-red-600 text-white"
              : "border-white/10 text-white/40 hover:border-white/30 hover:text-white/75"
          }`}
        >
          {g}
        </button>
      ))}
    </div>
  );
}