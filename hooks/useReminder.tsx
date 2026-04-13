import { useState } from "react";

export function useReminder() {
  const [reminded, setReminded] = useState<Set<number>>(new Set());

  const toggleRemind = (id: number) => {
    setReminded((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const isReminded = (id: number) => reminded.has(id);

  return { isReminded, toggleRemind };
}