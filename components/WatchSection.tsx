"use client";

import { useState, useEffect, useRef, useCallback } from "react";

type Movie = {
  id: number;
  title: string;
};

const SERVERS = [
  { id: "vidsrc-me",    label: "VidSrc",     getUrl: (id: number) => `https://vidsrc.me/embed/movie/${id}` },
  { id: "vidsrc-to",    label: "VidSrc 2",   getUrl: (id: number) => `https://vidsrc.to/embed/movie/${id}` },
  { id: "2embed",       label: "2Embed",     getUrl: (id: number) => `https://www.2embed.cc/embed/${id}` },
  { id: "superembed",   label: "SuperEmbed", getUrl: (id: number) => `https://multiembed.mov/?video_id=${id}&tmdb=1` },
  { id: "embedsoap",    label: "EmbedSoap",  getUrl: (id: number) => `https://www.embedsoap.com/embed/movie/?id=${id}` },
  { id: "autoembed",    label: "AutoEmbed",  getUrl: (id: number) => `https://autoembed.co/movie/tmdb/${id}` },
  { id: "smashystream", label: "Smashy",     getUrl: (id: number) => `https://player.smashy.stream/movie/${id}` },
  { id: "moviesapi",    label: "MoviesAPI",  getUrl: (id: number) => `https://moviesapi.club/movie/${id}` },
];

type ServerStatus = "idle" | "loading" | "ok" | "error";

function StatusDot({ status }: { status: ServerStatus }) {
  const colors: Record<ServerStatus, string> = {
    idle:    "rgba(255,255,255,0.18)",
    loading: "#f59e0b",
    ok:      "#22c55e",
    error:   "#ef4444",
  };
  const glow: Record<ServerStatus, string> = {
    idle:    "none",
    loading: "0 0 6px #f59e0b",
    ok:      "0 0 6px #22c55e",
    error:   "0 0 6px #ef4444",
  };
  return (
    <span
      style={{
        display: "inline-block",
        width: 7,
        height: 7,
        borderRadius: "50%",
        background: colors[status],
        boxShadow: glow[status],
        flexShrink: 0,
        transition: "background 0.3s, box-shadow 0.3s",
      }}
    />
  );
}

export default function WatchSection({ movie }: { movie: Movie }) {
  const [statuses, setStatuses] = useState<Record<string, ServerStatus>>(
    () => Object.fromEntries(SERVERS.map((s) => [s.id, "idle"]))
  );
  const [activeServer, setActiveServer] = useState(SERVERS[0]);
  const [iframeKey, setIframeKey] = useState(0);
  const [playerLoaded, setPlayerLoaded] = useState(false);
  const [autoTried, setAutoTried] = useState<string[]>([]);
  const [autoRunning, setAutoRunning] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const playerWrapRef = useRef<HTMLDivElement>(null);

  const setStatus = (id: string, status: ServerStatus) =>
    setStatuses((prev) => ({ ...prev, [id]: status }));

  const loadServer = useCallback((server: typeof SERVERS[0]) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setActiveServer(server);
    setPlayerLoaded(false);
    setIframeKey((k) => k + 1);
    setStatus(server.id, "loading");
    timeoutRef.current = setTimeout(() => {
      setStatus(server.id, "error");
      setPlayerLoaded(false);
    }, 12000);
  }, []);

  const switchServer = (server: typeof SERVERS[0]) => {
    setAutoRunning(false);
    setAutoTried([]);
    loadServer(server);
  };

  const handleLoad = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setStatus(activeServer.id, "ok");
    setPlayerLoaded(true);
    setAutoRunning(false);
  };

  // Auto fallback ke server berikutnya jika error
  useEffect(() => {
    if (!autoRunning) return;
    const currentStatus = statuses[activeServer.id];
    if (currentStatus === "error") {
      const remaining = SERVERS.filter(
        (s) => !autoTried.includes(s.id) && s.id !== activeServer.id
      );
      if (remaining.length === 0) { setAutoRunning(false); return; }
      const next = remaining[0];
      setAutoTried((prev) => [...prev, activeServer.id]);
      loadServer(next);
    }
  }, [statuses, activeServer, autoRunning, autoTried, loadServer]);

  const startAutoDetect = () => {
    setStatuses(Object.fromEntries(SERVERS.map((s) => [s.id, "idle"])));
    setAutoTried([]);
    setAutoRunning(true);
    loadServer(SERVERS[0]);
  };

  // Init saat movie berubah
  useEffect(() => {
    startAutoDetect();
    return () => { if (timeoutRef.current) clearTimeout(timeoutRef.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [movie.id]);

  // Fullscreen
  const toggleFullscreen = () => {
    if (!playerWrapRef.current) return;
    if (!document.fullscreenElement) {
      playerWrapRef.current.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  };

  useEffect(() => {
    const onFsChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", onFsChange);
    return () => document.removeEventListener("fullscreenchange", onFsChange);
  }, []);

  const allFailed = SERVERS.every((s) => statuses[s.id] === "error");

  return (
    <div
      id="watch"
      style={{
        background: "#080a0f",
        borderTop: "1px solid rgba(255,255,255,0.06)",
        padding: "3rem 3.5rem",
      }}
    >
      {/* ── HEADER ── */}
      <div className="flex items-start justify-between flex-wrap gap-4" style={{ marginBottom: "1.5rem" }}>
        <div>
          <p style={{ fontSize: "10px", fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: "rgba(255,255,255,0.22)", marginBottom: "4px" }}>
            Now Streaming
          </p>
          <h2 className="font-black tracking-tight text-white" style={{ fontSize: "clamp(1.2rem, 2.5vw, 1.8rem)" }}>
            Watch <span style={{ color: "#ef4444" }}>{movie.title}</span>
          </h2>
          {autoRunning && (
            <p style={{ fontSize: "11px", color: "#f59e0b", marginTop: "4px" }}>
              ⚡ Mencari server terbaik…
            </p>
          )}
          {!autoRunning && playerLoaded && (
            <p style={{ fontSize: "11px", color: "#22c55e", marginTop: "4px" }}>
              ✓ Terhubung via {activeServer.label}
            </p>
          )}
          {allFailed && (
            <p style={{ fontSize: "11px", color: "#ef4444", marginTop: "4px" }}>
              ✗ Semua server tidak tersedia saat ini
            </p>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Tombol Fullscreen */}
          <button
            onClick={toggleFullscreen}
            title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
            style={{
              padding: "8px 14px",
              borderRadius: "999px",
              fontSize: "12px",
              fontWeight: 600,
              background: "rgba(255,255,255,0.08)",
              border: "1px solid rgba(255,255,255,0.1)",
              color: "rgba(255,255,255,0.7)",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "6px",
              transition: "all 0.2s",
            }}
          >
            {isFullscreen ? (
              <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 9L4 4m0 0h5m-5 0v5M15 9l5-5m0 0h-5m5 0v5M9 15l-5 5m0 0h5m-5 0v-5M15 15l5 5m0 0h-5m5 0v-5" />
              </svg>
            ) : (
              <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 8V4m0 0h4M4 4l5 5m11-5h-4m4 0v4m0-4l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
              </svg>
            )}
            {isFullscreen ? "Exit" : "Fullscreen"}
          </button>

          {/* Tombol Auto Detect */}
          <button
            onClick={startAutoDetect}
            disabled={autoRunning}
            style={{
              padding: "8px 18px",
              borderRadius: "999px",
              fontSize: "12px",
              fontWeight: 600,
              background: autoRunning ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.08)",
              border: "1px solid rgba(255,255,255,0.1)",
              color: autoRunning ? "rgba(255,255,255,0.3)" : "rgba(255,255,255,0.7)",
              cursor: autoRunning ? "not-allowed" : "pointer",
              transition: "all 0.2s",
            }}
          >
            {autoRunning ? "Detecting…" : "↺ Auto Detect"}
          </button>
        </div>
      </div>

      {/* ── SERVER LIST ── */}
      <div className="flex flex-wrap gap-2" style={{ marginBottom: "1.25rem" }}>
        {SERVERS.map((s) => {
          const status = statuses[s.id];
          const isActive = activeServer.id === s.id;
          return (
            <button
              key={s.id}
              onClick={() => switchServer(s)}
              className="flex items-center gap-2 transition-all duration-200"
              style={{
                padding: "6px 14px",
                borderRadius: "999px",
                fontSize: "12px",
                fontWeight: 600,
                border: isActive
                  ? "1px solid rgba(239,68,68,0.6)"
                  : "1px solid rgba(255,255,255,0.08)",
                background: isActive
                  ? "rgba(239,68,68,0.15)"
                  : status === "error"
                  ? "rgba(255,255,255,0.03)"
                  : "rgba(255,255,255,0.06)",
                color: isActive
                  ? "#ef4444"
                  : status === "error"
                  ? "rgba(255,255,255,0.25)"
                  : "rgba(255,255,255,0.6)",
                cursor: "pointer",
                textDecoration: status === "error" ? "line-through" : "none",
              }}
            >
              <StatusDot status={isActive ? status : statuses[s.id]} />
              {s.label}
            </button>
          );
        })}
      </div>

      {/* ── PLAYER ── */}
      <div ref={playerWrapRef} style={{ background: "#080a0f" }}>
        <div
          className="relative rounded-2xl overflow-hidden w-full"
          style={{
            paddingBottom: "56.25%",
            height: 0,
            boxShadow: "0 0 80px rgba(220,38,38,0.08), 0 12px 60px rgba(0,0,0,0.7)",
            border: "1px solid rgba(255,255,255,0.07)",
          }}
        >
          {/* Loading overlay */}
          {!playerLoaded && !allFailed && (
            <div
              className="absolute inset-0 flex flex-col items-center justify-center gap-3"
              style={{ background: "#0d0f16", zIndex: 1 }}
            >
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: "50%",
                  border: "2px solid rgba(255,255,255,0.08)",
                  borderTop: "2px solid #ef4444",
                  animation: "spin 0.8s linear infinite",
                }}
              />
              <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.3)", letterSpacing: "0.06em" }}>
                {autoRunning ? `Mencoba ${activeServer.label}…` : `Memuat ${activeServer.label}…`}
              </p>
              <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
          )}

          {/* All failed state */}
          {allFailed && (
            <div
              className="absolute inset-0 flex flex-col items-center justify-center gap-3"
              style={{ background: "#0d0f16", zIndex: 1 }}
            >
              <div style={{ fontSize: "32px" }}>😔</div>
              <p style={{ fontSize: "14px", color: "rgba(255,255,255,0.5)", fontWeight: 600 }}>
                Film ini tidak tersedia di semua server
              </p>
              <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.25)" }}>
                Coba lagi nanti atau pilih film lain
              </p>
              <button
                onClick={startAutoDetect}
                style={{
                  marginTop: "8px",
                  padding: "8px 20px",
                  borderRadius: "999px",
                  background: "#ef4444",
                  color: "white",
                  fontSize: "12px",
                  fontWeight: 700,
                  border: "none",
                  cursor: "pointer",
                }}
              >
                Coba Lagi
              </button>
            </div>
          )}

          <iframe
            key={iframeKey}
            src={activeServer.getUrl(movie.id)}
            allowFullScreen
            allow="autoplay; fullscreen; picture-in-picture; accelerometer; gyroscope; clipboard-write; encrypted-media"
            onLoad={handleLoad}
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              border: "none",
              opacity: playerLoaded ? 1 : 0,
              transition: "opacity 0.4s ease",
            }}
            referrerPolicy="no-referrer"
          />
        </div>
      </div>

      <p style={{ marginTop: "12px", fontSize: "11px", color: "rgba(255,255,255,0.18)", textAlign: "center" }}>
        Klik server lain jika film tidak bisa diputar. Dot hijau = tersedia, merah = tidak tersedia.
      </p>
    </div>
  );
}