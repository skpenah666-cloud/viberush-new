"use client";

import { useEffect, useMemo, useState } from "react";
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
  genre?: string | null;
  cover_url?: string | null;
  user_id?: string | null;
  created_at?: string;
};

type ArtistResult = {
  userId: string;
  artist: string;
  songCount: number;
  coverUrl?: string | null;
};

export default function SearchPage() {
  const [songs, setSongs] = useState<Song[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);

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
    if (!query.trim()) return songs;

    const q = query.toLowerCase();

    return songs.filter((song) => {
      return (
        song.title.toLowerCase().includes(q) ||
        song.artist.toLowerCase().includes(q) ||
        (song.genre || "").toLowerCase().includes(q)
      );
    });
  }, [songs, query]);

  const artistResults = useMemo(() => {
    const artistMap = new Map<string, ArtistResult>();

    filteredSongs.forEach((song) => {
      if (!song.user_id) return;

      const existing = artistMap.get(song.user_id);

      if (existing) {
        artistMap.set(song.user_id, {
          ...existing,
          songCount: existing.songCount + 1,
          coverUrl: existing.coverUrl || song.cover_url,
        });
      } else {
        artistMap.set(song.user_id, {
          userId: song.user_id,
          artist: song.artist,
          songCount: 1,
          coverUrl: song.cover_url,
        });
      }
    });

    return Array.from(artistMap.values()).slice(0, 8);
  }, [filteredSongs]);

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
      filteredSongs.map((item) => ({
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
      <nav className="sticky top-0 z-20 flex items-center justify-between border-b border-zinc-900 bg-black/70 p-4 backdrop-blur-xl md:p-6">
        <a href="/" className="text-2xl font-black text-orange-500">
          VibeRush
        </a>

        <div className="flex gap-2 md:gap-3">
          <a
            href="/discover"
            className="rounded-full border border-zinc-700 px-4 py-2 text-sm font-bold transition hover:bg-zinc-900"
          >
            Discover
          </a>

          <a
            href="/library"
            className="rounded-full bg-orange-500 px-4 py-2 text-sm font-black text-black transition hover:bg-orange-400"
          >
            Library
          </a>
        </div>
      </nav>

      <section className="mx-auto max-w-7xl px-4 py-8 md:px-6 md:py-10">
        <div className="mb-8 overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-950/80 shadow-2xl">
          <div className="relative p-6 md:p-8">
            <div className="absolute right-0 top-0 h-64 w-64 rounded-full bg-orange-500/10 blur-3xl" />

            <div className="relative">
              <p className="text-sm font-bold uppercase tracking-widest text-orange-400">
                Search Engine
              </p>

              <h1 className="mt-3 text-5xl font-black md:text-7xl">
                Search VibeRush 🔍
              </h1>

              <p className="mt-3 max-w-2xl text-zinc-400">
                Find songs, artists, genres, and creators across the platform.
              </p>

              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search songs, artists, genres..."
                className="mt-6 w-full rounded-2xl border border-zinc-800 bg-black p-4 text-white outline-none transition placeholder:text-zinc-600 focus:border-orange-500"
              />

              <div className="mt-4 flex flex-wrap gap-2">
                {["Afrobeats", "Amapiano", "Hip-Hop", "Dancehall", "Gospel", "R&B"].map(
                  (genre) => (
                    <button
                      key={genre}
                      onClick={() => setQuery(genre)}
                      className="rounded-full border border-zinc-700 bg-black/60 px-4 py-2 text-sm font-bold text-zinc-300 transition hover:bg-zinc-900 hover:text-white"
                    >
                      {genre}
                    </button>
                  )
                )}
              </div>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="rounded-3xl border border-zinc-800 bg-zinc-950/80 p-10 text-center text-orange-300">
            Loading search...
          </div>
        ) : (
          <>
            {artistResults.length > 0 && (
              <div className="mb-10">
                <div className="mb-5 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-bold uppercase tracking-widest text-orange-400">
                      Artists
                    </p>

                    <h2 className="mt-2 text-3xl font-black">
                      Creator Results
                    </h2>
                  </div>

                  <p className="text-sm text-zinc-500">
                    {artistResults.length} found
                  </p>
                </div>

                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                  {artistResults.map((artist) => (
                    <a
                      key={artist.userId}
                      href={`/artist/${artist.userId}`}
                      className="group rounded-3xl border border-zinc-800 bg-zinc-950/80 p-5 shadow-2xl transition hover:-translate-y-1 hover:border-orange-500 hover:bg-orange-950/20"
                    >
                      <div className="h-24 w-24 overflow-hidden rounded-3xl bg-zinc-900">
                        {artist.coverUrl ? (
                          <img
                            src={artist.coverUrl}
                            alt={`${artist.artist} cover`}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-4xl">
                            👤
                          </div>
                        )}
                      </div>

                      <h3 className="mt-4 truncate text-xl font-black text-white">
                        {artist.artist}
                      </h3>

                      <p className="mt-1 text-sm text-zinc-400">
                        {artist.songCount} song
                        {artist.songCount === 1 ? "" : "s"}
                      </p>

                      <p className="mt-4 text-sm font-black text-orange-400">
                        View Artist →
                      </p>
                    </a>
                  ))}
                </div>
              </div>
            )}

            <div>
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold uppercase tracking-widest text-orange-400">
                    Songs
                  </p>

                  <h2 className="mt-2 text-3xl font-black">
                    Track Results
                  </h2>
                </div>

                <p className="text-sm text-zinc-500">
                  {filteredSongs.length} found
                </p>
              </div>

              {filteredSongs.length === 0 ? (
                <div className="rounded-3xl border border-zinc-800 bg-zinc-950/80 p-10 text-center">
                  <h2 className="text-2xl font-black">No results found</h2>

                  <p className="mt-2 text-zinc-400">
                    Try another song title, artist, or genre.
                  </p>
                </div>
              ) : (
                <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                  {filteredSongs.map((song, index) => {
                    const isCurrentSong = currentSong?.id === song.id;

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

                          {song.genre && (
                            <div className="absolute left-4 top-4 rounded-full bg-orange-500 px-3 py-1 text-xs font-black text-black">
                              {song.genre}
                            </div>
                          )}

                          {isCurrentSong && (
                            <div className="absolute right-4 top-4 rounded-full bg-green-500 px-3 py-1 text-xs font-black text-black">
                              Playing
                            </div>
                          )}

                          <div className="absolute bottom-4 left-4 right-4">
                            <p className="text-xs font-bold uppercase tracking-widest text-zinc-400">
                              Search Result #{index + 1}
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
                              {isCurrentSong ? "Playing" : "Play"}
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
            </div>
          </>
        )}
      </section>
    </main>
  );
}