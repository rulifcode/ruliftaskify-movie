// app/tv/[id]/season/[season]/episode/[episode]/page.tsx
// ✅ Server Component — tidak ada "use client" di sini

import { getSeasonEpisodes, getSeriesDetails, getSimilarSeries } from "@/services/seriesService";
import Header from "@/components/Header";
import Link from "next/link";
import EpisodePlayer from "@/components/EpisodePlayer";
import RelatedSeries from "@/components/RelatedSeries";
import Footer from "@/components/Footer";

type Props = {
    params: Promise<{
        id: string;
        season: string;
        episode: string;
    }>;
};

export default async function EpisodePage({ params }: Props) {
    const { id, season, episode } = await params;

    let series = null;
    let episodes: any[] = [];
    let related: any[] = [];

    try {
        [series, episodes, related] = await Promise.all([
            getSeriesDetails(Number(id)),
            getSeasonEpisodes(Number(id), Number(season)),
            getSimilarSeries(Number(id)),
        ]);
    } catch {
        series = null;
        episodes = [];
        related = [];
    }

    if (!series) {
        return (
            <div className="min-h-screen bg-[#080a0f] flex items-center justify-center">
                <p className="text-white/50 text-lg">Episode not found.</p>
            </div>
        );
    }

    const currentEp = episodes.find((e) => e.episode_number === Number(episode));
    const currentIndex = episodes.findIndex(
        (e) => e.episode_number === Number(episode)
    );
    const prevEp = currentIndex > 0 ? episodes[currentIndex - 1] : null;
    const nextEp =
        currentIndex < episodes.length - 1 ? episodes[currentIndex + 1] : null;
    const realSeasons = (series.seasons ?? []).filter(
        (s: any) => s.season_number > 0
    );

    return (
        // flex flex-col agar footer selalu di bawah konten
        <div className="min-h-screen bg-[#080a0f] text-white flex flex-col">
            <Header />

            {/* flex-1 agar konten mendorong footer ke bawah */}
            <div className="flex-1 max-w-7xl w-full mx-auto px-6 py-8">
                {/* Breadcrumb */}
                <div className="flex items-center gap-2 text-xs text-white/30 mb-6 flex-wrap">
                    <Link href="/series" className="hover:text-white/60 transition-colors">
                        Series
                    </Link>
                    <span>/</span>
                    <Link href={`/tv/${id}`} className="hover:text-white/60 transition-colors">
                        {series.name}
                    </Link>
                    <span>/</span>
                    <span className="text-white/50">Season {season}</span>
                    <span>/</span>
                    <span className="text-white/50">Episode {episode}</span>
                </div>

                <div className="flex gap-8">
                    {/* ── LEFT: Player + Info + Related ── */}
                    <div className="flex-1 min-w-0">
                        <EpisodePlayer id={id} season={season} episode={episode} />

                        {/* Episode Info */}
                        <div className="mb-6">
                            <div className="flex items-start justify-between gap-4 mb-3">
                                <div>
                                    <p className="text-white/30 text-xs font-mono mb-1">
                                        S{String(season).padStart(2, "0")} · E
                                        {String(episode).padStart(2, "0")}
                                    </p>
                                    <h1 className="text-white text-2xl font-bold leading-tight">
                                        {currentEp?.name ?? `Episode ${episode}`}
                                    </h1>
                                </div>

                                <div className="flex-shrink-0 flex items-center gap-3">
                                    {currentEp?.vote_average > 0 && (
                                        <span className="flex items-center gap-1.5 text-yellow-400 font-bold text-sm">
                                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                            </svg>
                                            {currentEp.vote_average.toFixed(1)}
                                        </span>
                                    )}
                                    {currentEp?.runtime && (
                                        <span className="text-white/35 text-sm">{currentEp.runtime}m</span>
                                    )}
                                    {currentEp?.air_date && (
                                        <span className="text-white/35 text-sm">{currentEp.air_date}</span>
                                    )}
                                </div>
                            </div>

                            {currentEp?.overview && (
                                <p className="text-white/55 text-sm leading-relaxed">
                                    {currentEp.overview}
                                </p>
                            )}
                        </div>

                        {/* Prev / Next Navigation */}
                        <div className="flex gap-3">
                            {prevEp ? (
                                <Link
                                    href={`/tv/${id}/season/${season}/episode/${prevEp.episode_number}`}
                                    className="flex-1 flex items-center gap-3 p-4 rounded-xl bg-white/[0.04] border border-white/[0.07] hover:bg-white/[0.07] transition-all no-underline"
                                >
                                    <svg
                                        className="w-4 h-4 text-white/40 flex-shrink-0"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                        strokeWidth={2}
                                    >
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                                    </svg>
                                    <div className="min-w-0">
                                        <p className="text-white/25 text-[10px] uppercase tracking-widest">Previous</p>
                                        <p className="text-white/70 text-xs font-semibold line-clamp-1 mt-0.5">
                                            E{String(prevEp.episode_number).padStart(2, "0")} · {prevEp.name}
                                        </p>
                                    </div>
                                </Link>
                            ) : (
                                <div className="flex-1" />
                            )}

                            {nextEp && (
                                <Link
                                    href={`/tv/${id}/season/${season}/episode/${nextEp.episode_number}`}
                                    className="flex-1 flex items-center justify-end gap-3 p-4 rounded-xl bg-red-500/[0.08] border border-red-500/20 hover:bg-red-500/[0.15] transition-all no-underline"
                                >
                                    <div className="min-w-0 text-right">
                                        <p className="text-red-400/60 text-[10px] uppercase tracking-widest">Next</p>
                                        <p className="text-white/70 text-xs font-semibold line-clamp-1 mt-0.5">
                                            E{String(nextEp.episode_number).padStart(2, "0")} · {nextEp.name}
                                        </p>
                                    </div>
                                    <svg
                                        className="w-4 h-4 text-red-400 flex-shrink-0"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                        strokeWidth={2}
                                    >
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                                    </svg>
                                </Link>
                            )}
                        </div>

                        {/* Related Series */}
                        <RelatedSeries related={related} />
                    </div>

                    {/* ── RIGHT: Episode Sidebar ── */}
                    <div
                        className="flex-shrink-0 overflow-y-auto [scrollbar-width:none] sticky top-20"
                        style={{ width: 300, maxHeight: "calc(100vh - 120px)" }}
                    >
                        {/* Season selector */}
                        <div className="flex gap-2 flex-wrap mb-4">
                            {realSeasons.map((s: any) => (
                                <Link
                                    key={s.season_number}
                                    href={`/tv/${id}/season/${s.season_number}/episode/1`}
                                    className={`text-xs font-semibold px-3 py-1.5 rounded-full transition-all border no-underline ${
                                        s.season_number === Number(season)
                                            ? "bg-red-500/15 text-red-400 border-red-500/35"
                                            : "bg-white/5 text-white/40 border-white/[0.08] hover:bg-white/10 hover:text-white/60"
                                    }`}
                                >
                                    S{s.season_number}
                                </Link>
                            ))}
                        </div>

                        {/* Episode list */}
                        <div className="flex flex-col gap-2">
                            {episodes.map((ep: any) => {
                                const isActive = ep.episode_number === Number(episode);
                                return (
                                    <Link
                                        key={ep.id}
                                        href={`/tv/${id}/season/${season}/episode/${ep.episode_number}`}
                                        className={`flex gap-3 rounded-xl p-2.5 transition-all border no-underline ${
                                            isActive
                                                ? "bg-red-500/10 border-red-500/30"
                                                : "bg-white/[0.03] border-white/5 hover:bg-white/[0.06] hover:border-white/10"
                                        }`}
                                    >
                                        {/* Thumbnail */}
                                        <div className="flex-shrink-0 w-20 h-12 rounded-lg overflow-hidden bg-white/[0.06]">
                                            {ep.still_path ? (
                                                <img
                                                    src={`https://image.tmdb.org/t/p/w300${ep.still_path}`}
                                                    alt={ep.name}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-white/15">
                                                    <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                                                        <path d="M8 5v14l11-7z" />
                                                    </svg>
                                                </div>
                                            )}
                                        </div>

                                        {/* Info */}
                                        <div className="flex-1 min-w-0">
                                            <span className={`text-[9px] font-mono ${isActive ? "text-red-400" : "text-white/25"}`}>
                                                E{String(ep.episode_number).padStart(2, "0")}
                                            </span>
                                            <p className={`text-[11px] font-semibold leading-tight line-clamp-2 mt-0.5 ${isActive ? "text-white" : "text-white/60"}`}>
                                                {ep.name}
                                            </p>
                                            {ep.runtime && (
                                                <p className="text-[9px] text-white/20 mt-0.5">{ep.runtime}m</p>
                                            )}
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>

            {/* ✅ Footer — di luar flex gap-8, full width di paling bawah */}
            <Footer />
        </div>
    );
}