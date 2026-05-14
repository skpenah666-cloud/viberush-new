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

type Play = {
  song_id: string;
};

type Like = {
  song_id: string;
};

type Comment = {
  song_id: string;
};

export default function DashboardPage() {
  const [songs, setSongs] = useState<Song[]>([]);
  const [plays, setPlays] = useState<Play[]>([]);
  const [likes, setLikes] = useState<Like[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [followerCount, setFollowerCount] = useState(0);

  const [userId, setUserId] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  const [loading, setLoading] = useState(true);

  const fetchDashboard = async () => {
    const { data: userData } = await supabase.auth.getUser();

    const user = userData.user;

    if (!user) {
      setLoading(false);
      return;
    }

    setUserId(user.id);
    setUserEmail(user.email || null);

    const { data: songData } = await supabase
      .from("songs")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    const artistSongs = songData || [];

    const songIds = artistSongs.map((song) => song.id);

    const { data: playData } = songIds.length
      ? await supabase
          .from("recently_played")
          .select("song_id")
          .in("song_id", songIds)
      : { data: [] };

    const { data: likeData } = songIds.length
      ? await supabase
          .from("likes")
          .select("song_id")
          .in("song_id", songIds)
      : { data: [] };

    const { data: commentData } = songIds.length
      ? await supabase
          .from("comments")
          .select("song_id")
          .in("song_id", songIds)
      : { data: [] };

    const { count } = await supabase
      .from("follows")
      .select("*", { count: "exact", head: true })
      .eq("artist_id", user.id);

    setSongs(artistSongs);
    setPlays(playData || []);
    setLikes(likeData || []);
    setComments(commentData || []);
    setFollowerCount(count || 0);

    setLoading(false);
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const totalPlays = plays.length;
  const totalLikes = likes.length;
  const totalComments = comments.length;

  const engagementRate =
    totalPlays === 0
      ? 0
      : Math.round(
          ((totalLikes + totalComments) / totalPlays) * 100
        );

  const songStats = useMemo(() => {
    return songs.map((song) => {
      const playCount = plays.filter(
        (play) => play.song_id === song.id
      ).length;

      const likeCount = likes.filter(
        (like) => like.song_id === song.id
      ).length;

      const commentCount = comments.filter(
        (comment) => comment.song_id === song.id
      ).length;

      return {
        ...song,
        playCount,
        likeCount,
        commentCount,
      };
    });
  }, [songs, plays, likes, comments]);

  const topSong = [...songStats].sort(
    (a, b) => b.playCount - a.playCount
  )[0];

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
            href="/upload"
            className="rounded-full bg-orange-500 px-4 py-2 text-sm font-black text-black transition hover:bg-orange-400"
          >
            Upload
          </a>
        </div>
      </nav>

      <section className="mx-auto max-w-7xl px-4 py-8 md:px-6 md:py-10">
        <div className="mb-8 rounded-3xl border border-zinc-800 bg-zinc-950/80 p-6 shadow-2xl md:p-8">
          <p className="text-sm font-bold uppercase tracking-widest text-orange-400">
            Creator Analytics
          </p>

          <h1 className="mt-3 text-5xl font-black">
            Dashboard 📊
          </h1>

          <p className="mt-3 max-w-2xl text-zinc-400">
            Monitor your creator growth, track performance,
            audience engagement, and platform momentum.
          </p>

          {userEmail && (
            <p className="mt-5 rounded-xl border border-zinc-800 bg-black/60 p-3 text-sm text-zinc-400">
              Logged in as {userEmail}
            </p>
          )}
        </div>

        {loading ? (
          <div className="rounded-3xl border border-zinc-800 bg-zinc-950/80 p-10 text-center text-orange-300">
            Loading dashboard...
          </div>
        ) : !userId ? (
          <div className="rounded-3xl border border-zinc-800 bg-zinc-950/80 p-10 text-center">
            <h2 className="text-2xl font-black">
              Login required
            </h2>

            <p className="mt-2 text-zinc-400">
              Log in to view your creator dashboard.
            </p>

            <a
              href="/auth"
              className="mt-6 inline-block rounded-full bg-orange-500 px-6 py-3 font-black text-black"
            >
              Login
            </a>
          </div>
        ) : (
          <>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
              <div className="rounded-3xl border border-zinc-800 bg-black/70 p-6">
                <p className="text-4xl font-black text-orange-400">
                  {songs.length}
                </p>

                <p className="mt-2 text-sm font-bold uppercase tracking-widest text-zinc-500">
                  Uploads
                </p>
              </div>

              <div className="rounded-3xl border border-zinc-800 bg-black/70 p-6">
                <p className="text-4xl font-black text-orange-400">
                  {totalPlays}
                </p>

                <p className="mt-2 text-sm font-bold uppercase tracking-widest text-zinc-500">
                  Plays
                </p>
              </div>

              <div className="rounded-3xl border border-zinc-800 bg-black/70 p-6">
                <p className="text-4xl font-black text-orange-400">
                  {totalLikes}
                </p>

                <p className="mt-2 text-sm font-bold uppercase tracking-widest text-zinc-500">
                  Likes
                </p>
              </div>

              <div className="rounded-3xl border border-zinc-800 bg-black/70 p-6">
                <p className="text-4xl font-black text-orange-400">
                  {totalComments}
                </p>

                <p className="mt-2 text-sm font-bold uppercase tracking-widest text-zinc-500">
                  Comments
                </p>
              </div>

              <div className="rounded-3xl border border-zinc-800 bg-black/70 p-6">
                <p className="text-4xl font-black text-orange-400">
                  {followerCount}
                </p>

                <p className="mt-2 text-sm font-bold uppercase tracking-widest text-zinc-500">
                  Followers
                </p>
              </div>
            </div>

            <div className="mt-8 grid gap-5 lg:grid-cols-3">
              <div className="rounded-3xl border border-zinc-800 bg-zinc-950/80 p-6 shadow-2xl">
                <p className="text-sm font-bold uppercase tracking-widest text-orange-400">
                  Engagement
                </p>

                <h2 className="mt-3 text-5xl font-black">
                  {engagementRate}%
                </h2>

                <p className="mt-3 text-zinc-400">
                  Calculated from likes + comments relative to total plays.
                </p>
              </div>

              <div className="rounded-3xl border border-zinc-800 bg-zinc-950/80 p-6 shadow-2xl">
                <p className="text-sm font-bold uppercase tracking-widest text-orange-400">
                  Top Performing Song
                </p>

                {topSong ? (
                  <>
                    <h2 className="mt-3 truncate text-3xl font-black">
                      {topSong.title}
                    </h2>

                    <p className="mt-2 text-orange-300">
                      {topSong.artist}
                    </p>

                    <p className="mt-4 text-sm text-zinc-400">
                      {topSong.playCount} plays •{" "}
                      {topSong.likeCount} likes
                    </p>
                  </>
                ) : (
                  <p className="mt-4 text-zinc-500">
                    No uploads yet.
                  </p>
                )}
              </div>

              <div className="rounded-3xl border border-zinc-800 bg-zinc-950/80 p-6 shadow-2xl">
                <p className="text-sm font-bold uppercase tracking-widest text-orange-400">
                  Creator Momentum
                </p>

                <h2 className="mt-3 text-5xl font-black">
                  {songs.length + followerCount + totalLikes}
                </h2>

                <p className="mt-3 text-zinc-400">
                  Combined creator activity score across the platform.
                </p>
              </div>
            </div>

            <div className="mt-8 rounded-3xl border border-zinc-800 bg-zinc-950/80 p-6 shadow-2xl">
              <div className="flex items-center justify-between gap-4">
                <h2 className="text-2xl font-black">
                  Track Performance
                </h2>

                <a
                  href="/upload"
                  className="rounded-full bg-orange-500 px-5 py-3 text-sm font-black text-black transition hover:bg-orange-400"
                >
                  Upload More
                </a>
              </div>

              <div className="mt-6 grid gap-4">
                {songStats.length === 0 ? (
                  <p className="text-zinc-500">
                    Upload songs to see analytics here.
                  </p>
                ) : (
                  songStats.map((song) => (
                    <div
                      key={song.id}
                      className="grid gap-4 rounded-2xl border border-zinc-800 bg-black/60 p-4 md:grid-cols-[90px_1fr_auto]"
                    >
                      <div className="h-24 w-24 overflow-hidden rounded-2xl bg-zinc-900">
                        {song.cover_url ? (
                          <img
                            src={song.cover_url}
                            alt={`${song.title} cover`}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-3xl">
                            🎧
                          </div>
                        )}
                      </div>

                      <div className="min-w-0">
                        <h3 className="truncate text-2xl font-black text-orange-300">
                          {song.title}
                        </h3>

                        <p className="truncate text-sm text-zinc-400">
                          {song.artist}
                        </p>

                        <div className="mt-3 flex flex-wrap gap-2">
                          <a
                            href={`/song/${song.id}`}
                            className="rounded-full bg-zinc-800 px-4 py-2 text-xs font-black text-white transition hover:bg-zinc-700"
                          >
                            Open Song
                          </a>

                          {song.user_id && (
                            <a
                              href={`/artist/${song.user_id}`}
                              className="rounded-full bg-zinc-800 px-4 py-2 text-xs font-black text-white transition hover:bg-zinc-700"
                            >
                              Artist Page
                            </a>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-3 md:items-center">
                        <div className="rounded-xl border border-zinc-800 px-4 py-3 text-center">
                          <p className="text-xl font-black text-orange-400">
                            {song.playCount}
                          </p>

                          <p className="text-xs text-zinc-500">
                            Plays
                          </p>
                        </div>

                        <div className="rounded-xl border border-zinc-800 px-4 py-3 text-center">
                          <p className="text-xl font-black text-orange-400">
                            {song.likeCount}
                          </p>

                          <p className="text-xs text-zinc-500">
                            Likes
                          </p>
                        </div>

                        <div className="rounded-xl border border-zinc-800 px-4 py-3 text-center">
                          <p className="text-xl font-black text-orange-400">
                            {song.commentCount}
                          </p>

                          <p className="text-xs text-zinc-500">
                            Comments
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </>
        )}
      </section>
    </main>
  );
}