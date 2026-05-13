"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@supabase/supabase-js";

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
  genre?: string | null;
  user_id?: string | null;
  created_at?: string;
};

type Play = {
  song_id: string;
};

export default function Home() {
  const [songs, setSongs] = useState<Song[]>([]);
  const [plays, setPlays] = useState<Play[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHomeFeed = async () => {
      const { data: songsData } = await supabase
        .from("songs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(8);

      const { data: playsData } = await supabase
        .from("recently_played")
        .select("song_id");

      setSongs(songsData || []);
      setPlays(playsData || []);
      setLoading(false);
    };

    fetchHomeFeed();
  }, []);

  const trendingSongs = useMemo(() => {
    const playCounts = plays.reduce<Record<string, number>>((acc, play) => {
      acc[play.song_id] = (acc[play.song_id] || 0) + 1;
      return acc;
    }, {});

    return songs
      .map((song) => ({
        ...song,
        playCount: playCounts[song.id] || 0,
      }))
      .sort((a, b) => b.playCount - a.playCount)
      .slice(0, 3);
  }, [songs, plays]);

  const latestSongs = songs.slice(0, 4);
  const genres = ["Afrobeats", "Dancehall", "Hip-Hop", "Gospel", "R&B", "Amapiano"];

  return (
    <main className="min-h-screen overflow-hidden bg-gradient-to-br from-black via-zinc-950 to-orange-950 text-white">
      <nav className="sticky top-0 z-20 flex items-center justify-between border-b border-zinc-900 bg-black/40 p-4 backdrop-blur-xl md:p-6">
        <h1 className="text-2xl font-black text-orange-500">VibeRush</h1>

        <div className="flex flex-wrap gap-2 md:gap-3">
          <a
            href="/discover"
            className="rounded-full border border-zinc-700 px-4 py-2 text-sm font-bold text-white transition hover:bg-zinc-900 active:scale-95"
          >
            Discover
          </a>

          <a
            href="/trending"
            className="rounded-full border border-orange-500/40 bg-orange-500/10 px-4 py-2 text-sm font-bold text-orange-300 transition hover:bg-orange-500/20 active:scale-95"
          >
            Trending
          </a>

          <a
            href="/upload"
            className="rounded-full bg-white px-5 py-2 text-sm font-bold text-black transition hover:bg-zinc-200 active:scale-95"
          >
            Upload
          </a>

          <a
            href="/library"
            className="rounded-full border border-zinc-700 px-5 py-2 text-sm font-bold text-white transition hover:bg-zinc-900 active:scale-95"
          >
            Library
          </a>
        </div>
      </nav>

      <section className="relative mx-auto flex min-h-[82vh] max-w-6xl flex-col items-center justify-center px-6 py-16 text-center">
        <div className="absolute left-0 top-20 h-72 w-72 rounded-full bg-orange-500/10 blur-3xl" />
        <div className="absolute bottom-10 right-0 h-80 w-80 rounded-full bg-red-500/10 blur-3xl" />

        <p className="relative mb-5 rounded-full border border-orange-500/40 bg-orange-500/10 px-5 py-2 text-sm font-semibold text-orange-300 backdrop-blur-xl">
          African sounds. Global energy.
        </p>

        <h2 className="relative text-5xl font-black tracking-tight md:text-7xl">
          Upload your sound.
          <br />
          <span className="text-orange-500">Build your wave.</span>
        </h2>

        <p className="relative mt-6 max-w-2xl text-lg leading-relaxed text-zinc-400 md:text-xl">
          VibeRush helps creators upload, stream, manage, trend, and share music with a premium modern experience.
        </p>

        <div className="relative mt-10 flex flex-col gap-4 sm:flex-row">
          <a
            href="/upload"
            className="rounded-full bg-orange-500 px-8 py-4 font-black text-black transition hover:bg-orange-400 active:scale-95"
          >
            Start Uploading
          </a>

          <a
            href="/discover"
            className="rounded-full border border-orange-500 bg-orange-500/10 px-8 py-4 font-black text-orange-300 transition hover:bg-orange-500/20 active:scale-95"
          >
            Discover Music
          </a>

          <a
            href="/trending"
            className="rounded-full border border-zinc-700 px-8 py-4 font-black text-white transition hover:bg-zinc-900 active:scale-95"
          >
            Explore Trending
          </a>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-20">
        <div className="grid gap-6 md:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-3xl border border-zinc-800 bg-zinc-950/70 p-6 shadow-2xl backdrop-blur-xl">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <p className="text-sm font-bold uppercase tracking-widest text-orange-400">
                  Live Charts
                </p>
                <h3 className="mt-1 text-3xl font-black">Trending Now 🔥</h3>
              </div>

              <a href="/trending" className="text-sm font-bold text-orange-400 underline">
                View all
              </a>
            </div>

            {loading ? (
              <p className="text-zinc-500">Loading trending songs...</p>
            ) : trendingSongs.length === 0 ? (
              <p className="text-zinc-500">Play songs to start trending data.</p>
            ) : (
              <div className="grid gap-4">
                {trendingSongs.map((song, index) => (
                  <a
                    key={song.id}
                    href={`/song/${song.id}`}
                    className="grid grid-cols-[70px_1fr_auto] items-center gap-4 rounded-2xl border border-zinc-800 bg-black/60 p-3 transition hover:bg-zinc-900"
                  >
                    <div className="h-16 w-16 overflow-hidden rounded-2xl bg-zinc-900">
                      {song.cover_url ? (
                        <img
                          src={song.cover_url}
                          alt={`${song.title} cover`}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-2xl">
                          🎧
                        </div>
                      )}
                    </div>

                    <div className="min-w-0 text-left">
                      <p className="truncate font-black text-orange-300">
                        {song.title}
                      </p>
                      <p className="truncate text-sm text-zinc-400">
                        {song.artist}
                      </p>
                    </div>

                    <p className="text-sm font-black text-zinc-500">
                      #{index + 1}
                    </p>
                  </a>
                ))}
              </div>
            )}
          </div>

          <div className="rounded-3xl border border-zinc-800 bg-zinc-950/70 p-6 shadow-2xl backdrop-blur-xl">
            <p className="text-sm font-bold uppercase tracking-widest text-orange-400">
              Browse Vibes
            </p>

            <h3 className="mt-1 text-3xl font-black">Discover</h3>

            <div className="mt-6 flex flex-wrap gap-2">
              {genres.map((genre) => (
                <a
                  key={genre}
                  href="/discover"
                  className="rounded-full border border-zinc-800 bg-black/60 px-4 py-3 text-sm font-black text-zinc-300 transition hover:border-orange-500 hover:text-orange-300"
                >
                  {genre}
                </a>
              ))}
            </div>

            <a
              href="/dashboard"
              className="mt-8 block rounded-2xl border border-orange-500/30 bg-orange-500/10 p-5 transition hover:bg-orange-500/20"
            >
              <p className="text-3xl">📊</p>
              <h4 className="mt-3 font-black text-orange-300">
                Creator Dashboard
              </h4>
              <p className="mt-2 text-sm text-zinc-400">
                Track uploads, plays, likes, and followers.
              </p>
            </a>
          </div>
        </div>

        <div className="mt-6 rounded-3xl border border-zinc-800 bg-zinc-950/70 p-6 shadow-2xl backdrop-blur-xl">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <p className="text-sm font-bold uppercase tracking-widest text-orange-400">
                Fresh Drops
              </p>
              <h3 className="mt-1 text-3xl font-black">Latest Uploads</h3>
            </div>

            <a href="/library" className="text-sm font-bold text-orange-400 underline">
              Library
            </a>
          </div>

          {loading ? (
            <p className="text-zinc-500">Loading latest uploads...</p>
          ) : latestSongs.length === 0 ? (
            <p className="text-zinc-500">No uploads yet.</p>
          ) : (
            <div className="grid gap-4 md:grid-cols-4">
              {latestSongs.map((song) => (
                <a
                  key={song.id}
                  href={`/song/${song.id}`}
                  className="overflow-hidden rounded-3xl border border-zinc-800 bg-black/60 transition hover:-translate-y-1 hover:shadow-orange-900/20"
                >
                  <div className="h-40 bg-zinc-900">
                    {song.cover_url ? (
                      <img
                        src={song.cover_url}
                        alt={`${song.title} cover`}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-4xl">
                        🎧
                      </div>
                    )}
                  </div>

                  <div className="p-4 text-left">
                    <p className="truncate font-black text-orange-300">
                      {song.title}
                    </p>
                    <p className="truncate text-sm text-zinc-400">
                      {song.artist}
                    </p>
                    <p className="mt-2 text-xs text-zinc-600">
                      {song.genre || "Other"}
                    </p>
                  </div>
                </a>
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}