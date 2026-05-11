"use client";

import { useEffect, useState } from "react";
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
  created_at?: string;
};

export default function ArtistPage({ params }: { params: { id: string } }) {
  const [songs, setSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchArtistSongs = async () => {
      const { data } = await supabase
        .from("songs")
        .select("*")
        .eq("user_id", params.id)
        .order("created_at", { ascending: false });

      setSongs(data || []);
      setLoading(false);
    };

    fetchArtistSongs();
  }, [params.id]);

  const artistName = songs[0]?.artist || "Artist";

  return (
    <main className="min-h-screen bg-gradient-to-br from-black via-zinc-950 to-orange-950 pb-24 text-white">
      <nav className="flex items-center justify-between border-b border-zinc-900 bg-black/70 p-6 backdrop-blur-xl">
        <a href="/" className="text-2xl font-black text-orange-500">
          VibeRush
        </a>

        <a
          href="/library"
          className="rounded-full bg-orange-500 px-5 py-2 text-sm font-black text-black"
        >
          Library
        </a>
      </nav>

      <section className="mx-auto max-w-6xl px-6 py-10">
        <div className="mb-8 rounded-3xl border border-zinc-800 bg-zinc-950/80 p-8 shadow-2xl">
          <p className="text-sm font-bold uppercase tracking-widest text-orange-400">
            Artist Profile
          </p>

          <h1 className="mt-3 text-5xl font-black">{artistName}</h1>

          <p className="mt-3 text-zinc-400">
            {loading
              ? "Loading artist catalog..."
              : `${songs.length} track${songs.length === 1 ? "" : "s"} uploaded`}
          </p>
        </div>

        {loading ? (
          <div className="rounded-3xl border border-zinc-800 bg-zinc-950/80 p-10 text-center text-orange-300">
            Loading...
          </div>
        ) : songs.length === 0 ? (
          <div className="rounded-3xl border border-zinc-800 bg-zinc-950/80 p-10 text-center">
            <h2 className="text-2xl font-black">No songs found</h2>
          </div>
        ) : (
          <div className="grid gap-5 md:grid-cols-2">
            {songs.map((song, index) => (
              <div
                key={song.id}
                className="overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-950/80 shadow-2xl"
              >
                <div className="relative h-56 bg-zinc-900">
                  {song.cover_url ? (
                    <img
                      src={song.cover_url}
                      alt={`${song.title} cover`}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center bg-gradient-to-br from-orange-950 via-black to-zinc-900 text-5xl">
                      🎧
                    </div>
                  )}

                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />

                  <div className="absolute bottom-4 left-4 right-4">
                    <p className="text-xs font-bold uppercase tracking-widest text-zinc-400">
                      Track {index + 1}
                    </p>
                    <h2 className="truncate text-2xl font-black">
                      {song.title}
                    </h2>
                    <p className="truncate text-sm text-orange-300">
                      {song.artist}
                    </p>
                  </div>
                </div>

                <div className="p-5">
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