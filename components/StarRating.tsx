import { useState } from "react";
import { Star } from "lucide-react";

interface Props {
  value: number;
  onChange?: (val: number) => void;
  readonly?: boolean;
}

export default function StarRating({ value, onChange, readonly = false }: Props) {
  const [hovered, setHovered] = useState(0);

  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          size={18}
          className={`transition-colors ${
            (hovered || value) >= star
              ? "fill-yellow-400 text-yellow-400"
              : "text-gray-600"
          } ${!readonly ? "cursor-pointer hover:scale-110 transition-transform" : ""}`}
          onClick={() => !readonly && onChange?.(star)}
          onMouseEnter={() => !readonly && setHovered(star)}
          onMouseLeave={() => !readonly && setHovered(0)}
        />
      ))}
    </div>
  );
}