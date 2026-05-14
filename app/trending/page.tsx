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
  user_id?: string | null;
  cover_url?: string | null;
  created_at?: string;
};

type Play = {
  song_id: string;
  created_at?: string;
};

type Like = {
  song_id: string;
};

type Comment = {
  song_id: string;
};

type RankedSong = Song & {
  playCount: number;
  likeCount: number;
  commentCount: number;
  trendingScore: number;
};

export default function TrendingPage() {
  const [songs, setSongs] = useState<Song[]>([]);
  const [plays, setPlays] = useState<Play[]>([]);
  const [likes, setLikes] = useState<Like[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);

  const { currentSong, playSong: startPlayer } = usePlayer();

  useEffect(() => {
    const fetchTrending = async () => {
      const [
        songsRes,
        playsRes,
        likesRes,
        commentsRes,
      ] = await Promise.all([
        supabase
          .from("songs")
          .select("*")
          .order("created_at", { ascending: false }),

        supabase
          .from("recently_played")
          .select("song_id, created_at"),

        supabase
          .from("likes")
          .select("song_id"),

        supabase
          .from("comments")
          .select("song_id"),
      ]);

      setSongs(songsRes.data || []);
      setPlays(playsRes.data || []);
      setLikes(likesRes.data || []);
      setComments(commentsRes.data || []);

      setLoading(false);
    };

    fetchTrending();
  }, []);

  const trendingSongs = useMemo(() => {
    const now = Date.now();

    const playCounts = plays.reduce<Record<string, number>>(
      (acc, play) => {
        acc[play.song_id] = (acc[play.song_id] || 0) + 1;
        return acc;
      },
      {}
    );

    const likeCounts = likes.reduce<Record<string, number>>(
      (acc, like) => {
        acc[like.song_id] = (acc[like.song_id] || 0) + 1;
        return acc;
      },
      {}
    );

    const commentCounts = comments.reduce<Record<string, number>>(
      (acc, comment) => {
        acc[comment.song_id] =
          (acc[comment.song_id] || 0) + 1;

        return acc;
      },
      {}
    );

    const ranked: RankedSong[] = songs.map((song) => {
      const playCount = playCounts[song.id] || 0;
      const likeCount = likeCounts[song.id] || 0;
      const commentCount = commentCounts[song.id] || 0;

      const createdAt = song.created_at
        ? new Date(song.created_at).getTime()
        : now;

      const ageHours = Math.max(
        1,
        (now - createdAt) / (1000 * 60 * 60)
      );

      const recencyBoost = Math.max(1, 72 / ageHours);

      const trendingScore =
        playCount * 1.5 +
        likeCount * 4 +
        commentCount * 6 +
        recencyBoost;

      return {
        ...song,
        playCount,
        likeCount,
        commentCount,
        trendingScore,
      };
    });

    return ranked.sort(
      (a, b) => b.trendingScore - a.trendingScore
    );
  }, [songs, plays, likes, comments]);

  const topGenres = useMemo(() => {
    const counts: Record<string, number> = {};

    trendingSongs.forEach((song) => {
      const genre = song.genre || "Other";
      counts[genre] = (counts[genre] || 0) + 1;
    });

    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([genre]) => genre);
  }, [trendingSongs]);

  const playSong = (song: RankedSong) => {
    startPlayer(
      {
        id: song.id,
        title: song.title,
        artist: song.artist,
        url: song.url,
        coverUrl: song.cover_url,
        userId: song.user_id,
      },
      trendingSongs.map((item) => ({
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
            href="/recommended"
            className="rounded-full border border-zinc-700 px-4 py-2 text-sm font-bold transition hover:bg-zinc-900"
          >
            For You
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
            <div className="absolute right-0 top-0 h-72 w-72 rounded-full bg-orange-500/10 blur-3xl" />

            <div className="relative">
              <p className="text-sm font-bold uppercase tracking-widest text-orange-400">
                Live Charts
              </p>

              <h1 className="mt-3 text-5xl font-black">
                Trending Now 🔥
              </h1>

              <p className="mt-3 max-w-2xl text-zinc-400">
                Ranked using plays, likes, comments,
                momentum, and recency across VibeRush.
              </p>

              {topGenres.length > 0 && (
                <div className="mt-5 flex flex-wrap gap-2">
                  {topGenres.map((genre) => (
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
          <div className="rounded-3xl border border-zinc-800 bg-zinc-950/80 p-10 text-center">
            <p className="font-bold text-orange-300">
              Calculating charts...
            </p>
          </div>
        ) : trendingSongs.length === 0 ? (
          <div className="rounded-3xl border border-zinc-800 bg-zinc-950/80 p-10 text-center">
            <h2 className="text-2xl font-black">
              No trending songs yet
            </h2>

            <p className="mt-2 text-zinc-400">
              Platform activity will generate charts automatically.
            </p>
          </div>
        ) : (
          <div className="grid gap-5">
            {trendingSongs.map((song, index) => {
              const isCurrentSong =
                currentSong?.id === song.id;

              return (
                <div
                  key={song.id}
                  className={`grid gap-5 overflow-hidden rounded-3xl border p-5 shadow-2xl transition md:grid-cols-[170px_1fr] ${
                    isCurrentSong
                      ? "border-orange-500 bg-orange-950/30"
                      : "border-zinc-800 bg-zinc-950/80 hover:border-orange-500/40"
                  }`}
                >
                  <div className="relative h-44 overflow-hidden rounded-2xl bg-zinc-900">
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

                    <div className="absolute left-3 top-3 rounded-full bg-orange-500 px-3 py-1 text-xs font-black text-black">
                      #{index + 1}
                    </div>

                    {isCurrentSong && (
                      <div className="absolute bottom-3 right-3 rounded-full bg-green-500 px-3 py-1 text-xs font-black text-black">
                        Playing
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col justify-between gap-5">
                    <div>
                      <div className="flex flex-wrap gap-2">
                        <span className="rounded-full bg-zinc-800 px-3 py-1 text-xs font-black text-zinc-300">
                          ▶ {song.playCount}
                        </span>

                        <span className="rounded-full bg-pink-950/40 px-3 py-1 text-xs font-black text-pink-300">
                          ❤️ {song.likeCount}
                        </span>

                        <span className="rounded-full bg-blue-950/40 px-3 py-1 text-xs font-black text-blue-300">
                          💬 {song.commentCount}
                        </span>

                        <span className="rounded-full bg-orange-500 px-3 py-1 text-xs font-black text-black">
                          Score {song.trendingScore.toFixed(1)}
                        </span>
                      </div>

                      <h2 className="mt-4 truncate text-3xl font-black text-orange-300">
                        {song.title}
                      </h2>

                      <p className="truncate text-zinc-400">
                        {song.artist}
                      </p>
                    </div>

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

                      <a
                        href="/recommended"
                        className="rounded-full border border-zinc-700 px-5 py-3 text-sm font-black text-white transition hover:bg-zinc-900"
                      >
                        More Like This
                      </a>
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