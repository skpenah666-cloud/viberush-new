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
  cover_url?: string | null;
  user_id?: string | null;
  genre?: string | null;
  created_at?: string;
};

type RecentPlay = {
  id: string;
  song_id: string;
  user_id: string;
  played_at?: string;
};

export default function HistoryPage() {
  const [recentPlays, setRecentPlays] = useState<RecentPlay[]>([]);
  const [songs, setSongs] = useState<Song[]>([]);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const { currentSong, playSong: startPlayer } = usePlayer();

  const getToken = async () => {
    const { data } = await supabase.auth.getSession();
    return data.session?.access_token || null;
  };

  useEffect(() => {
    const fetchHistory = async () => {
      const { data: userData } = await supabase.auth.getUser();
      const user = userData.user;

      if (!user) {
        setLoading(false);
        return;
      }

      setUserEmail(user.email || null);

      const { data: playsData } = await supabase
        .from("recently_played")
        .select("*")
        .eq("user_id", user.id)
        .order("played_at", { ascending: false })
        .limit(50);

      const plays = playsData || [];
      const songIds = Array.from(new Set(plays.map((play) => play.song_id)));

      const { data: songsData } = songIds.length
        ? await supabase.from("songs").select("*").in("id", songIds)
        : { data: [] };

      setRecentPlays(plays);
      setSongs(songsData || []);
      setLoading(false);
    };

    fetchHistory();
  }, []);

  const historySongs = useMemo(() => {
    return recentPlays
      .map((play) => {
        const song = songs.find((item) => item.id === play.song_id);

        if (!song) return null;

        return {
          ...song,
          played_at: play.played_at,
          play_id: play.id,
        };
      })
      .filter(Boolean) as Array<Song & { played_at?: string; play_id: string }>;
  }, [recentPlays, songs]);

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
      historySongs.map((item) => ({
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
            href="/search"
            className="rounded-full border border-zinc-700 px-4 py-2 text-sm font-bold transition hover:bg-zinc-900"
          >
            Search
          </a>

          <a
            href="/library"
            className="rounded-full bg-orange-500 px-4 py-2 text-sm font-black text-black transition hover:bg-orange-400"
          >
            Library
          </a>
        </div>
      </nav>

      <section className="mx-auto max-w-6xl px-4 py-8 md:px-6 md:py-10">
        <div className="mb-8 rounded-3xl border border-zinc-800 bg-zinc-950/80 p-6 shadow-2xl md:p-8">
          <p className="text-sm font-bold uppercase tracking-widest text-orange-400">
            Listening History
          </p>

          <h1 className="mt-3 text-5xl font-black">Recently Played 🕘</h1>

          <p className="mt-3 max-w-xl text-zinc-400">
            Resume tracks you played recently and keep your listening flow going.
          </p>

          {userEmail && (
            <p className="mt-5 rounded-xl border border-zinc-800 bg-black/60 p-3 text-sm text-zinc-400">
              Listening as {userEmail}
            </p>
          )}
        </div>

        {loading ? (
          <div className="rounded-3xl border border-zinc-800 bg-zinc-950/80 p-10 text-center text-orange-300">
            Loading history...
          </div>
        ) : !userEmail ? (
          <div className="rounded-3xl border border-zinc-800 bg-zinc-950/80 p-10 text-center">
            <h2 className="text-2xl font-black">Login required</h2>

            <p className="mt-2 text-zinc-400">
              Log in to view your listening history.
            </p>

            <a
              href="/auth"
              className="mt-6 inline-block rounded-full bg-orange-500 px-6 py-3 font-black text-black"
            >
              Login
            </a>
          </div>
        ) : historySongs.length === 0 ? (
          <div className="rounded-3xl border border-zinc-800 bg-zinc-950/80 p-10 text-center">
            <h2 className="text-2xl font-black">No history yet</h2>

            <p className="mt-2 text-zinc-400">
              Play songs from Library, Discover, or Trending to build your history.
            </p>
          </div>
        ) : (
          <div className="grid gap-5 md:grid-cols-2">
            {historySongs.map((song, index) => {
              const isCurrentSong = currentSong?.id === song.id;

              return (
                <div
                  key={song.play_id}
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
                        Recently Played
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

                    {song.played_at && (
                      <p className="text-xs text-zinc-500">
                        Played {new Date(song.played_at).toLocaleString()}
                      </p>
                    )}

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
      </section>
    </main>
  );
}