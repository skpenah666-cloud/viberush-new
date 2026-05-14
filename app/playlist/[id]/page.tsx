"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import WaveformBars from "@/components/WaveformBars";
import { usePlayer } from "@/components/player/PlayerContext";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type Playlist = {
  id: string;
  name: string;
  user_id?: string | null;
  created_at?: string;
};

type PlaylistSong = {
  id: string;
  playlist_id: string;
  song_id: string;
  created_at?: string;
};

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

export default function PlaylistPage({ params }: { params: { id: string } }) {
  const [playlist, setPlaylist] = useState<Playlist | null>(null);
  const [playlistSongs, setPlaylistSongs] = useState<PlaylistSong[]>([]);
  const [songs, setSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);

  const { currentSong, playSong: startPlayer } = usePlayer();

  useEffect(() => {
    const fetchPlaylist = async () => {
      const { data: playlistData } = await supabase
        .from("playlists")
        .select("*")
        .eq("id", params.id)
        .maybeSingle();

      if (!playlistData) {
        setLoading(false);
        return;
      }

      setPlaylist(playlistData);

      const { data: playlistSongData } = await supabase
        .from("playlist_songs")
        .select("*")
        .eq("playlist_id", params.id)
        .order("created_at", { ascending: true });

      const rows = playlistSongData || [];
      const songIds = rows.map((row) => row.song_id);

      const { data: songData } = songIds.length
        ? await supabase.from("songs").select("*").in("id", songIds)
        : { data: [] };

      setPlaylistSongs(rows);
      setSongs(songData || []);
      setLoading(false);
    };

    fetchPlaylist();
  }, [params.id]);

  const orderedSongs = useMemo(() => {
    return playlistSongs
      .map((row) => songs.find((song) => song.id === row.song_id))
      .filter(Boolean) as Song[];
  }, [playlistSongs, songs]);

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
      orderedSongs.map((item) => ({
        id: item.id,
        title: item.title,
        artist: item.artist,
        url: item.url,
        coverUrl: item.cover_url,
        userId: item.user_id,
      }))
    );
  };

  const playPlaylist = () => {
    const firstSong = orderedSongs[0];
    if (!firstSong) return;
    playSong(firstSong);
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-black via-zinc-950 to-orange-950 pb-40 text-white">
      <nav className="sticky top-0 z-20 flex items-center justify-between border-b border-zinc-900 bg-black/70 p-4 backdrop-blur-xl md:p-6">
        <a href="/" className="text-2xl font-black text-orange-500">
          VibeRush
        </a>

        <div className="flex gap-2 md:gap-3">
          <a
            href="/library"
            className="rounded-full border border-zinc-700 px-4 py-2 text-sm font-bold transition hover:bg-zinc-900"
          >
            Library
          </a>

          <a
            href="/discover"
            className="rounded-full bg-orange-500 px-4 py-2 text-sm font-black text-black transition hover:bg-orange-400"
          >
            Discover
          </a>
        </div>
      </nav>

      <section className="mx-auto max-w-6xl px-4 py-8 md:px-6 md:py-10">
        {loading ? (
          <div className="rounded-3xl border border-zinc-800 bg-zinc-950/80 p-10 text-center text-orange-300">
            Loading playlist...
          </div>
        ) : !playlist ? (
          <div className="rounded-3xl border border-zinc-800 bg-zinc-950/80 p-10 text-center">
            <h1 className="text-3xl font-black">Playlist not found</h1>

            <a
              href="/library"
              className="mt-6 inline-block rounded-full bg-orange-500 px-6 py-3 font-black text-black"
            >
              Back to Library
            </a>
          </div>
        ) : (
          <>
            <div className="mb-8 rounded-3xl border border-zinc-800 bg-zinc-950/80 p-6 shadow-2xl md:p-8">
              <p className="text-sm font-bold uppercase tracking-widest text-orange-400">
                Playlist
              </p>

              <div className="mt-3 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
                <div>
                  <h1 className="text-5xl font-black">{playlist.name}</h1>

                  <p className="mt-3 text-zinc-400">
                    {orderedSongs.length} song
                    {orderedSongs.length === 1 ? "" : "s"} in this playlist.
                  </p>
                </div>

                <button
                  onClick={playPlaylist}
                  disabled={orderedSongs.length === 0}
                  className="rounded-full bg-orange-500 px-6 py-3 text-sm font-black text-black transition hover:bg-orange-400 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Play Playlist
                </button>
              </div>
            </div>

            {orderedSongs.length === 0 ? (
              <div className="rounded-3xl border border-zinc-800 bg-zinc-950/80 p-10 text-center">
                <h2 className="text-2xl font-black">No songs yet</h2>

                <p className="mt-2 text-zinc-400">
                  Add songs to this playlist from the Library page.
                </p>

                <a
                  href="/library"
                  className="mt-6 inline-block rounded-full bg-orange-500 px-6 py-3 font-black text-black"
                >
                  Open Library
                </a>
              </div>
            ) : (
              <div className="grid gap-5 md:grid-cols-2">
                {orderedSongs.map((song, index) => {
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

                        <div className="absolute left-4 top-4 rounded-full bg-orange-500 px-3 py-1 text-xs font-black text-black">
                          #{index + 1}
                        </div>

                        {isCurrentSong && (
                          <div className="absolute right-4 top-4 rounded-full bg-green-500 px-3 py-1 text-xs font-black text-black">
                            Playing
                          </div>
                        )}

                        <div className="absolute bottom-4 left-4 right-4">
                          <p className="text-xs font-bold uppercase tracking-widest text-zinc-400">
                            Playlist Track
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
          </>
        )}
      </section>
    </main>
  );
}