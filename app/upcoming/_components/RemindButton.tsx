"use client";

interface RemindButtonProps {
  id: number;
  isReminded: boolean;
  onToggle: (id: number) => void;
  size?: "sm" | "md";
}

export function RemindButton({
  id,
  isReminded,
  onToggle,
  size = "md",
}: RemindButtonProps) {
  const base = "font-bold tracking-wider uppercase border transition-all flex items-center gap-1.5";

  const sizeClass =
    size === "sm"
      ? "w-full text-[9px] py-1.5 rounded-md justify-center"
      : "text-[10px] px-3 py-1.5 rounded-lg";

  const stateClass = isReminded
    ? "border-red-500/40 text-red-400 bg-red-500/[0.06]"
    : "border-white/14 text-white/50 hover:border-red-500 hover:text-red-400";

  return (
    <button
      onClick={() => onToggle(id)}
      className={`${base} ${sizeClass} ${stateClass}`}
    >
      {isReminded ? "✓ Diingatkan" : size === "sm" ? "+ Ingatkan" : "Ingatkan"}
    </button>
  );
}