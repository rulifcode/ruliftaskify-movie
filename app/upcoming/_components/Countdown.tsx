"use client";

import { useEffect, useState } from "react";

interface CountdownProps {
  targetDate: string;
}

interface TimeLeft {
  days: number;
  hours: number;
  mins: number;
}

function getTimeLeft(targetDate: string): TimeLeft {
  const diff = Math.max(0, new Date(targetDate).getTime() - Date.now());
  return {
    days: Math.floor(diff / 86400000),
    hours: Math.floor((diff % 86400000) / 3600000),
    mins: Math.floor((diff % 3600000) / 60000),
  };
}

export function Countdown({ targetDate }: CountdownProps) {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>(getTimeLeft(targetDate));

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft(getTimeLeft(targetDate));
    }, 60_000);
    return () => clearInterval(interval);
  }, [targetDate]);

  const parts = [
    { n: timeLeft.days, l: "hari" },
    { n: timeLeft.hours, l: "jam" },
    { n: timeLeft.mins, l: "mnt" },
  ];

  return (
    <div className="flex gap-2">
      {parts.map((p) => (
        <div
          key={p.l}
          className="text-center bg-white/5 border border-white/[0.08] rounded-md px-2 py-1 min-w-[40px]"
        >
          <div className="text-base font-black text-white">
            {String(p.n).padStart(2, "0")}
          </div>
          <div className="text-[8px] font-bold tracking-widest uppercase text-white/25">
            {p.l}
          </div>
        </div>
      ))}
    </div>
  );
}