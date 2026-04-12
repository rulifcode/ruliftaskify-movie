"use client";

import { useState, useRef } from "react";

const SERVERS = [
  {
    label: "Server 1",
    getUrl: (id: string, season: string, episode: string) =>
      `https://vidsrc.me/embed/tv?tmdb=${id}&season=${season}&episode=${episode}`,
  },
  {
    label: "Server 2",
    getUrl: (id: string, season: string, episode: string) =>
      `https://vidsrc.xyz/embed/tv/${id}/${season}/${episode}`,
  },
  {
    label: "Server 3",
    getUrl: (id: string, season: string, episode: string) =>
      `https://www.2embed.cc/embedtv/${id}&s=${season}&e=${episode}`,
  },
  {
    label: "Server 4",
    getUrl: (id: string, season: string, episode: string) =>
      `https://multiembed.mov/?video_id=${id}&tmdb=1&s=${season}&e=${episode}`,
  },
  {
    label: "Server 5",
    getUrl: (id: string, season: string, episode: string) =>
      `https://vidsrc.to/embed/tv/${id}/${season}/${episode}`,
  },
];

type Props = {
  id: string;
  season: string;
  episode: string;
  onTheaterChange?: (isTheater: boolean) => void;
};

export default function EpisodePlayer({ id, season, episode, onTheaterChange }: Props) {
  const [activeServer, setActiveServer] = useState(0);
  const [isTheater, setIsTheater] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const toggleTheater = () => {
    const next = !isTheater;
    setIsTheater(next);
    onTheaterChange?.(next);
  };

  const handlePiP = () => {
    // PiP via iframe contentWindow (works on supported browsers)
    const iframe = iframeRef.current;
    if (!iframe) return;
    try {
      const video = iframe.contentDocument?.querySelector("video");
      if (video && document.pictureInPictureEnabled) {
        video.requestPictureInPicture();
      } else {
        // fallback: open in new tab
        window.open(SERVERS[activeServer].getUrl(id, season, episode), "_blank");
      }
    } catch {
      window.open(SERVERS[activeServer].getUrl(id, season, episode), "_blank");
    }
  };

  return (
    <div className="mb-5">
      {/* Server Switcher */}
      <div className="flex items-center gap-2 mb-3 flex-wrap">
        <span className="text-white/25 text-[10px] uppercase tracking-widest mr-1">
          Server
        </span>
        {SERVERS.map((server, index) => (
          <button
            key={index}
            onClick={() => setActiveServer(index)}
            className={`text-xs font-semibold px-3 py-1.5 rounded-full transition-all border cursor-pointer ${
              activeServer === index
                ? "bg-red-500/15 text-red-400 border-red-500/35"
                : "bg-white/5 text-white/40 border-white/[0.08] hover:bg-white/10 hover:text-white/60"
            }`}
          >
            {server.label}
          </button>
        ))}

        {/* Spacer */}
        <div className="flex-1" />

        {/* Theater Mode Toggle */}
        <button
          onClick={toggleTheater}
          title={isTheater ? "Exit theater mode" : "Theater mode"}
          className={`flex items-center gap-1.5 text-[11px] font-medium px-3 py-1.5 rounded-full border transition-all cursor-pointer ${
            isTheater
              ? "bg-red-500/15 text-red-400 border-red-500/35"
              : "bg-white/5 text-white/40 border-white/[0.08] hover:bg-white/10 hover:text-white/60"
          }`}
        >
          {isTheater ? (
            <>
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 9V4.5M9 9H4.5M9 9L3.75 3.75M9 15v4.5M9 15H4.5M9 15l-5.25 5.25M15 9h4.5M15 9V4.5M15 9l5.25-5.25M15 15h4.5M15 15v4.5m0-4.5l5.25 5.25" />
              </svg>
              Exit Theater
            </>
          ) : (
            <>
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15" />
              </svg>
              Theater
            </>
          )}
        </button>
      </div>

      {/* Player Wrapper — hover shows PiP button */}
      <div
        className={`relative group rounded-2xl overflow-hidden bg-black shadow-[0_8px_40px_rgba(0,0,0,0.6)] transition-all duration-300 ${
          isTheater ? "w-screen -mx-6 rounded-none" : "w-full"
        }`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="relative pb-[56.25%]">
          <iframe
            ref={iframeRef}
            key={`${activeServer}-${id}-${season}-${episode}`}
            src={SERVERS[activeServer].getUrl(id, season, episode)}
            className="absolute inset-0 w-full h-full border-none"
            allowFullScreen
            allow="fullscreen; autoplay; picture-in-picture"
          />
        </div>

        {/* Hover overlay — PiP + Fullscreen buttons */}
        <div
          className={`absolute top-3 right-3 flex gap-2 transition-all duration-200 ${
            isHovered ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-1 pointer-events-none"
          }`}
        >
          {/* Picture-in-Picture */}
          <button
            onClick={handlePiP}
            title="Picture-in-Picture"
            className="flex items-center gap-1.5 bg-black/70 hover:bg-black/90 text-white/80 hover:text-white text-[11px] font-medium px-3 py-1.5 rounded-full backdrop-blur-sm border border-white/10 transition-all cursor-pointer"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 8.25H7.5a2.25 2.25 0 00-2.25 2.25v9a2.25 2.25 0 002.25 2.25h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25H15M9 12l3 3m0 0l3-3m-3 3V2.25" />
            </svg>
            Pop out
          </button>

          {/* Open in new tab (fullscreen workaround) */}
          <button
            onClick={() => window.open(SERVERS[activeServer].getUrl(id, season, episode), "_blank")}
            title="Open in new tab"
            className="flex items-center gap-1.5 bg-black/70 hover:bg-black/90 text-white/80 hover:text-white text-[11px] font-medium px-3 py-1.5 rounded-full backdrop-blur-sm border border-white/10 transition-all cursor-pointer"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
            </svg>
            Full tab
          </button>
        </div>
      </div>

      <p className="text-white/20 text-[11px] mt-2">
        Kalau video tidak muncul, coba ganti ke server lain.
      </p>
    </div>
  );
}