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

type Like = {
  song_id: string;
};

export default function RecommendedPage() {
  const [songs, setSongs] = useState<Song[]>([]);
  const [likedSongIds, setLikedSongIds] = useState<string[]>([]);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const { currentSong, playSong: startPlayer } = usePlayer();

  const getToken = async () => {
    const { data } = await supabase.auth.getSession();
    return data.session?.access_token || null;
  };

  useEffect(() => {
    const fetchRecommendations = async () => {
      const { data: userData } = await supabase.auth.getUser();
      const user = userData.user;

      setUserEmail(user?.email || null);

      const { data: songsData } = await supabase
        .from("songs")
        .select("*")
        .order("created_at", { ascending: false });

      setSongs(songsData || []);

      if (user) {
        const { data: likesData } = await supabase
          .from("likes")
          .select("song_id")
          .eq("user_id", user.id);

        setLikedSongIds((likesData || []).map((like: Like) => like.song_id));
      }

      setLoading(false);
    };

    fetchRecommendations();
  }, []);

  const likedSongs = useMemo(() => {
    return songs.filter((song) => likedSongIds.includes(song.id));
  }, [songs, likedSongIds]);

  const favoriteGenres = useMemo(() => {
    const genreCounts = likedSongs.reduce<Record<string, number>>((acc, song) => {
      const genre = song.genre || "Other";
      acc[genre] = (acc[genre] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(genreCounts)
      .sort((a, b) => b[1] - a[1])
      .map(([genre]) => genre);
  }, [likedSongs]);

  const recommendedSongs = useMemo(() => {
    if (favoriteGenres.length === 0) {
      return songs.slice(0, 12);
    }

    return songs
      .filter((song) => !likedSongIds.includes(song.id))
      .sort((a, b) => {
        const aGenreScore = favoriteGenres.includes(a.genre || "Other") ? 1 : 0;
        const bGenreScore = favoriteGenres.includes(b.genre || "Other") ? 1 : 0;

        return bGenreScore - aGenreScore;
      })
      .slice(0, 12);
  }, [songs, likedSongIds, favoriteGenres]);

  const playSong = async (song: Song) => {
    startPlayer(
      {
        id: song.id,
        title: song.title,
        artist: song.artist,
        url: song.url,
        coverUrl: song.cover_url,
        userId: song.user_id,
      },
      recommendedSongs.map((item) => ({
        id: item.id,
        title: item.title,
        artist: item.artist,
        url: item.url,
        coverUrl: item.cover_url,
        userId: item.user_id,
      }))
    );

    const token = await getToken();

    if (token) {
      await fetch("/api/recently-played", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ songId: song.id }),
      });
    }
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

      <section className="mx-auto max-w-6xl px-4 py-8 md:px-6 md:py-10">
        <div className="mb-8 overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-950/80 shadow-2xl">
          <div className="relative p-6 md:p-8">
            <div className="absolute right-0 top-0 h-64 w-64 rounded-full bg-orange-500/10 blur-3xl" />

            <div className="relative">
              <p className="text-sm font-bold uppercase tracking-widest text-orange-400">
                Smart Discovery
              </p>

              <h1 className="mt-3 text-5xl font-black">
                Recommended For You ✨
              </h1>

              <p className="mt-3 max-w-2xl text-zinc-400">
                Personalized music picks based on your likes, favorite genres,
                and listening behavior.
              </p>

              {userEmail ? (
                <p className="mt-5 rounded-xl border border-zinc-800 bg-black/60 p-3 text-sm text-zinc-400">
                  Personalized for {userEmail}
                </p>
              ) : (
                <p className="mt-5 rounded-xl border border-orange-900 bg-orange-950/30 p-3 text-sm text-orange-200">
                  Log in and like songs to improve your recommendations.
                </p>
              )}

              {favoriteGenres.length > 0 && (
                <div className="mt-5 flex flex-wrap gap-2">
                  {favoriteGenres.map((genre) => (
                    <span
                      key={genre}
                      className="rounded-full bg-orange-500 px-4 py-2 text-xs font-black text-black"
                    >
                      {genre}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {loading ? (
          <div className="rounded-3xl border border-zinc-800 bg-zinc-950/80 p-10 text-center text-orange-300">
            Loading recommendations...
          </div>
        ) : recommendedSongs.length === 0 ? (
          <div className="rounded-3xl border border-zinc-800 bg-zinc-950/80 p-10 text-center">
            <h2 className="text-2xl font-black">No recommendations yet</h2>
            <p className="mt-2 text-zinc-400">
              Upload songs or like more tracks to unlock recommendations.
            </p>
          </div>
        ) : (
          <div className="grid gap-5 md:grid-cols-2">
            {recommendedSongs.map((song, index) => {
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
                      {song.genre || "Recommended"}
                    </div>

                    {isCurrentSong && (
                      <div className="absolute right-4 top-4 rounded-full bg-green-500 px-3 py-1 text-xs font-black text-black">
                        Playing
                      </div>
                    )}

                    <div className="absolute bottom-4 left-4 right-4">
                      <p className="text-xs font-bold uppercase tracking-widest text-zinc-400">
                        Recommendation #{index + 1}
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
      </section>
    </main>
  );
}