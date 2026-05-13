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
  user_id?: string | null;
  created_at?: string;
};

type PlayRow = {
  song_id: string;
};

export default function TrendingPage() {
  const [songs, setSongs] = useState<Song[]>([]);
  const [plays, setPlays] = useState<PlayRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTrending = async () => {
      const { data: songData } = await supabase
        .from("songs")
        .select("*")
        .order("created_at", { ascending: false });

      const { data: playData } = await supabase
        .from("recently_played")
        .select("song_id");

      setSongs(songData || []);
      setPlays(playData || []);
      setLoading(false);
    };

    fetchTrending();
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
      .sort((a, b) => b.playCount - a.playCount);
  }, [songs, plays]);

  return (
    <main className="min-h-screen bg-gradient-to-br from-black via-zinc-950 to-orange-950 pb-24 text-white">
      <nav className="sticky top-0 z-20 flex items-center justify-between border-b border-zinc-900 bg-black/70 p-6 backdrop-blur-xl">
        <a href="/" className="text-2xl font-black text-orange-500">
          VibeRush
        </a>

        <div className="flex gap-3">
          <a
            href="/library"
            className="rounded-full border border-zinc-700 px-5 py-2 text-sm font-bold transition hover:bg-zinc-900"
          >
            Library
          </a>

          <a
            href="/upload"
            className="rounded-full bg-orange-500 px-5 py-2 text-sm font-black text-black transition hover:bg-orange-400"
          >
            Upload
          </a>
        </div>
      </nav>

      <section className="mx-auto max-w-6xl px-6 py-10">
        <div className="mb-8 rounded-3xl border border-zinc-800 bg-zinc-950/80 p-8 shadow-2xl">
          <p className="text-sm font-bold uppercase tracking-widest text-orange-400">
            VibeRush Charts
          </p>

          <h1 className="mt-3 text-5xl font-black">Trending 🔥</h1>

          <p className="mt-3 max-w-xl text-zinc-400">
            Tracks ranked by recent plays across the platform.
          </p>
        </div>

        {loading ? (
          <div className="rounded-3xl border border-zinc-800 bg-zinc-950/80 p-10 text-center">
            <p className="font-bold text-orange-300">Loading trending songs...</p>
          </div>
        ) : trendingSongs.length === 0 ? (
          <div className="rounded-3xl border border-zinc-800 bg-zinc-950/80 p-10 text-center">
            <h2 className="text-2xl font-black">No trending songs yet</h2>
            <p className="mt-2 text-zinc-400">
              Play some songs from the library and they will appear here.
            </p>
          </div>
        ) : (
          <div className="grid gap-5">
            {trendingSongs.map((song, index) => (
              <div
                key={song.id}
                className="grid gap-5 overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-950/80 p-5 shadow-2xl md:grid-cols-[140px_1fr]"
              >
                <div className="relative h-36 overflow-hidden rounded-2xl bg-zinc-900">
                  {song.cover_url ? (
                    <img
                      src={song.cover_url}
                      alt={`${song.title} cover`}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-orange-950 via-black to-zinc-900 text-4xl">
                      🎧
                    </div>
                  )}

                  <div className="absolute left-3 top-3 rounded-full bg-orange-500 px-3 py-1 text-xs font-black text-black">
                    #{index + 1}
                  </div>
                </div>

                <div className="flex flex-col justify-between gap-4">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-widest text-zinc-500">
                      {song.playCount} play{song.playCount === 1 ? "" : "s"}
                    </p>

                    <h2 className="mt-1 truncate text-3xl font-black text-orange-300">
                      {song.title}
                    </h2>

                    <p className="truncate text-zinc-400">{song.artist}</p>
                  </div>

                  <audio controls className="w-full">
                    <source src={song.url} />
                  </audio>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}