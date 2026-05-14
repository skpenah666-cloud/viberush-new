"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import WaveformBars from "@/components/WaveformBars";
import { usePlayer } from "@/components/player/PlayerContext";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type Song = {
  id: string;
  title: string;
  artist: string;
  url: string;
  cover_url?: string | null;
  user_id?: string | null;
  genre?: string | null;
  created_at?: string;
};

const vibes = [
  "All",
  "Afrobeats",
  "Dancehall",
  "Hip-Hop",
  "Gospel",
  "R&B",
  "Amapiano",
  "Other",
];

const PAGE_SIZE = 8;

export default function DiscoverPage() {
  const [songs, setSongs] = useState<Song[]>([]);
  const [selectedVibe, setSelectedVibe] = useState("All");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [loading, setLoading] = useState(true);

  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  const { currentSong, playSong: startPlayer } = usePlayer();

  useEffect(() => {
    const fetchSongs = async () => {
      const { data } = await supabase
        .from("songs")
        .select("*")
        .order("created_at", { ascending: false });

      setSongs(data || []);
      setLoading(false);
    };

    fetchSongs();
  }, []);

  const filteredSongs = useMemo(() => {
    let result = songs;

    if (selectedVibe !== "All") {
      result = songs.filter((song) => {
        const genre = song.genre || "Other";

        return (
          genre.toLowerCase() === selectedVibe.toLowerCase()
        );
      });
    }

    return result;
  }, [songs, selectedVibe]);

  const visibleSongs = useMemo(() => {
    return filteredSongs.slice(0, visibleCount);
  }, [filteredSongs, visibleCount]);

  const trendingSongs = useMemo(() => {
    return [...songs].slice(0, 5);
  }, [songs]);

  const latestSongs = useMemo(() => {
    return [...songs].slice(0, 6);
  }, [songs]);

  const topGenres = useMemo(() => {
    const counts: Record<string, number> = {};

    songs.forEach((song) => {
      const genre = song.genre || "Other";

      counts[genre] = (counts[genre] || 0) + 1;
    });

    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([genre]) => genre);
  }, [songs]);

  useEffect(() => {
    const target = loadMoreRef.current;

    if (!target) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const first = entries[0];

        if (
          first.isIntersecting &&
          visibleCount < filteredSongs.length
        ) {
          setVisibleCount((prev) => prev + PAGE_SIZE);
        }
      },
      {
        threshold: 0.2,
      }
    );

    observer.observe(target);

    return () => observer.disconnect();
  }, [filteredSongs.length, visibleCount]);

  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [selectedVibe]);

  const playSong = (song: Song) => {
    startPlayer(
      {
        id: song.id,
        title: song.title,
        artist: song.artist,
        url: song.url,
        coverUrl: song.cover_url,
        userId: song.user_id,
      },
      visibleSongs.map((item) => ({
        id: item.id,
        title: item.title,
        artist: item.artist,
        url: item.url,
        coverUrl: item.cover_url,
        userId: item.user_id,
      }))
    );
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-black via-zinc-950 to-orange-950 pb-40 text-white">
      <nav className="sticky top-0 z-30 flex items-center justify-between border-b border-zinc-900 bg-black/70 p-4 backdrop-blur-xl md:p-6">
        <a href="/" className="text-2xl font-black text-orange-500">
          VibeRush
        </a>

        <div className="flex gap-2 md:gap-3">
          <a
            href="/recommended"
            className="rounded-full border border-zinc-700 px-4 py-2 text-sm font-bold transition hover:bg-zinc-900"
          >
            For You
          </a>

          <a
            href="/trending"
            className="rounded-full border border-zinc-700 px-4 py-2 text-sm font-bold transition hover:bg-zinc-900"
          >
            Trending
          </a>

          <a
            href="/upload"
            className="rounded-full bg-orange-500 px-4 py-2 text-sm font-black text-black transition hover:bg-orange-400"
          >
            Upload
          </a>
        </div>
      </nav>

      <section className="mx-auto max-w-7xl px-4 py-8 md:px-6 md:py-10">
        <div className="relative overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-950/80 shadow-2xl">
          <div className="absolute right-0 top-0 h-72 w-72 rounded-full bg-orange-500/10 blur-3xl" />

          <div className="relative p-6 md:p-8">
            <p className="text-sm font-bold uppercase tracking-widest text-orange-400">
              Infinite Discovery
            </p>

            <h1 className="mt-3 text-5xl font-black md:text-7xl">
              Explore Music 🚀
            </h1>

            <p className="mt-4 max-w-2xl text-lg text-zinc-400">
              Discover trending sounds, fresh uploads,
              rising creators, and personalized vibes.
            </p>

            {topGenres.length > 0 && (
              <div className="mt-6 flex flex-wrap gap-2">
                {topGenres.map((genre) => (
                  <button
                    key={genre}
                    onClick={() => setSelectedVibe(genre)}
                    className="rounded-full bg-orange-500 px-4 py-2 text-xs font-black text-black transition hover:bg-orange-400"
                  >
                    {genre}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="mt-8 grid gap-5 lg:grid-cols-3">
          <div className="rounded-3xl border border-zinc-800 bg-zinc-950/80 p-6 shadow-2xl">
            <p className="text-sm font-bold uppercase tracking-widest text-orange-400">
              Trending Right Now
            </p>

            <div className="mt-5 space-y-3">
              {trendingSongs.map((song, index) => (
                <button
                  key={song.id}
                  onClick={() => playSong(song)}
                  className="flex w-full items-center gap-3 rounded-2xl border border-zinc-800 bg-black/50 p-3 text-left transition hover:border-orange-500"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-500 text-sm font-black text-black">
                    #{index + 1}
                  </div>

                  <div className="min-w-0">
                    <h3 className="truncate font-black">
                      {song.title}
                    </h3>

                    <p className="truncate text-xs text-zinc-400">
                      {song.artist}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-zinc-800 bg-zinc-950/80 p-6 shadow-2xl">
            <p className="text-sm font-bold uppercase tracking-widest text-orange-400">
              Latest Uploads
            </p>

            <div className="mt-5 space-y-3">
              {latestSongs.map((song) => (
                <button
                  key={song.id}
                  onClick={() => playSong(song)}
                  className="flex w-full items-center gap-3 rounded-2xl border border-zinc-800 bg-black/50 p-3 text-left transition hover:border-orange-500"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-800 text-lg">
                    🎵
                  </div>

                  <div className="min-w-0">
                    <h3 className="truncate font-black">
                      {song.title}
                    </h3>

                    <p className="truncate text-xs text-zinc-400">
                      {song.artist}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-zinc-800 bg-zinc-950/80 p-6 shadow-2xl">
            <p className="text-sm font-bold uppercase tracking-widest text-orange-400">
              Browse Vibes
            </p>

            <div className="mt-5 flex flex-wrap gap-2">
              {vibes.map((vibe) => (
                <button
                  key={vibe}
                  onClick={() => setSelectedVibe(vibe)}
                  className={`rounded-full px-5 py-3 text-sm font-black transition ${
                    selectedVibe === vibe
                      ? "bg-orange-500 text-black"
                      : "border border-zinc-800 bg-black/60 text-zinc-300 hover:bg-zinc-900"
                  }`}
                >
                  {vibe}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-10">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <p className="text-sm font-bold uppercase tracking-widest text-orange-400">
                Endless Feed
              </p>

              <h2 className="mt-2 text-3xl font-black">
                {selectedVibe === "All"
                  ? "All Discoveries"
                  : `${selectedVibe} Music`}
              </h2>
            </div>

            <p className="text-sm text-zinc-500">
              {filteredSongs.length} songs
            </p>
          </div>

          {loading ? (
            <div className="rounded-3xl border border-zinc-800 bg-zinc-950/80 p-10 text-center text-orange-300">
              Loading discovery...
            </div>
          ) : visibleSongs.length === 0 ? (
            <div className="rounded-3xl border border-zinc-800 bg-zinc-950/80 p-10 text-center">
              <h2 className="text-2xl font-black">
                No songs found
              </h2>

              <p className="mt-2 text-zinc-400">
                Try another vibe or upload new music.
              </p>
            </div>
          ) : (
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {visibleSongs.map((song, index) => {
                const isCurrentSong =
                  currentSong?.id === song.id;

                return (
                  <div
                    key={song.id}
                    className={`overflow-hidden rounded-3xl border shadow-2xl transition hover:-translate-y-1 ${
                      isCurrentSong
                        ? "border-orange-500 bg-orange-950/30 shadow-orange-900/30"
                        : "border-zinc-800 bg-zinc-950/80 hover:shadow-orange-900/20"
                    }`}
                  >
                    <div className="relative h-56 bg-zinc-900">
                      {song.cover_url ? (
                        <img
                          src={song.cover_url}
                          alt={`${song.title} cover`}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-orange-950 via-black to-zinc-900 text-5xl">
                          🎧
                        </div>
                      )}

                      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />

                      <div className="absolute left-4 top-4 rounded-full bg-orange-500 px-3 py-1 text-xs font-black text-black">
                        {song.genre || "Other"}
                      </div>

                      {isCurrentSong && (
                        <div className="absolute right-4 top-4 rounded-full bg-green-500 px-3 py-1 text-xs font-black text-black">
                          Playing
                        </div>
                      )}

                      <div className="absolute bottom-4 left-4 right-4">
                        <p className="text-xs font-bold uppercase tracking-widest text-zinc-400">
                          Discovery #{index + 1}
                        </p>

                        <h2 className="truncate text-2xl font-black text-white">
                          {song.title}
                        </h2>

                        <p className="truncate text-sm text-orange-300">
                          {song.artist}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-4 p-5">
                      <WaveformBars />

                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={() => playSong(song)}
                          className="rounded-full bg-orange-500 px-5 py-3 text-sm font-black text-black transition hover:bg-orange-400"
                        >
                          {isCurrentSong
                            ? "Playing"
                            : "Play"}
                        </button>

                        <a
                          href={`/song/${song.id}`}
                          className="rounded-full bg-zinc-800 px-5 py-3 text-sm font-black text-white transition hover:bg-zinc-700"
                        >
                          Open Song
                        </a>

                        {song.user_id && (
                          <a
                            href={`/artist/${song.user_id}`}
                            className="rounded-full bg-zinc-800 px-5 py-3 text-sm font-black text-white transition hover:bg-zinc-700"
                          >
                            Artist
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {!loading &&
            visibleCount < filteredSongs.length && (
              <div
                ref={loadMoreRef}
                className="mt-10 flex justify-center"
              >
                <div className="rounded-full border border-zinc-800 bg-zinc-950/80 px-6 py-3 text-sm font-black text-orange-300">
                  Loading more music...
                </div>
              </div>
            )}
        </div>
      </section>
    </main>
  );
}