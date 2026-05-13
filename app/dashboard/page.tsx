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

export default function DashboardPage() {
  const [songs, setSongs] = useState<Song[]>([]);
  const [plays, setPlays] = useState<Play[]>([]);
  const [likes, setLikes] = useState<Like[]>([]);
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
      ? await supabase.from("recently_played").select("song_id").in("song_id", songIds)
      : { data: [] };

    const { data: likeData } = songIds.length
      ? await supabase.from("likes").select("song_id").in("song_id", songIds)
      : { data: [] };

    const { count } = await supabase
      .from("follows")
      .select("*", { count: "exact", head: true })
      .eq("artist_id", user.id);

    setSongs(artistSongs);
    setPlays(playData || []);
    setLikes(likeData || []);
    setFollowerCount(count || 0);
    setLoading(false);
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const totalPlays = plays.length;
  const totalLikes = likes.length;

  const songStats = useMemo(() => {
    return songs.map((song) => {
      const playCount = plays.filter((play) => play.song_id === song.id).length;
      const likeCount = likes.filter((like) => like.song_id === song.id).length;

      return {
        ...song,
        playCount,
        likeCount,
      };
    });
  }, [songs, plays, likes]);

  return (
    <main className="min-h-screen bg-gradient-to-br from-black via-zinc-950 to-orange-950 pb-24 text-white">
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

      <section className="mx-auto max-w-6xl px-4 py-8 md:px-6 md:py-10">
        <div className="mb-8 rounded-3xl border border-zinc-800 bg-zinc-950/80 p-6 shadow-2xl md:p-8">
          <p className="text-sm font-bold uppercase tracking-widest text-orange-400">
            Creator Analytics
          </p>

          <h1 className="mt-3 text-5xl font-black">Dashboard 📊</h1>

          <p className="mt-3 max-w-xl text-zinc-400">
            Track your uploads, plays, likes, followers, and creator growth.
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
            <h2 className="text-2xl font-black">Login required</h2>
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
            <div className="grid gap-4 md:grid-cols-4">
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
                  {followerCount}
                </p>
                <p className="mt-2 text-sm font-bold uppercase tracking-widest text-zinc-500">
                  Followers
                </p>
              </div>
            </div>

            <div className="mt-8 rounded-3xl border border-zinc-800 bg-zinc-950/80 p-6 shadow-2xl">
              <h2 className="text-2xl font-black">Track Performance</h2>

              <div className="mt-6 grid gap-4">
                {songStats.length === 0 ? (
                  <p className="text-zinc-500">
                    Upload songs to see analytics here.
                  </p>
                ) : (
                  songStats.map((song) => (
                    <div
                      key={song.id}
                      className="grid gap-4 rounded-2xl border border-zinc-800 bg-black/60 p-4 md:grid-cols-[80px_1fr_auto]"
                    >
                      <div className="h-20 w-20 overflow-hidden rounded-2xl bg-zinc-900">
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

                      <div className="min-w-0">
                        <h3 className="truncate text-xl font-black text-orange-300">
                          {song.title}
                        </h3>
                        <p className="truncate text-sm text-zinc-400">
                          {song.artist}
                        </p>
                        <a
                          href={`/song/${song.id}`}
                          className="mt-2 inline-block text-sm font-bold text-orange-400 underline"
                        >
                          View song page
                        </a>
                      </div>

                      <div className="flex gap-3 md:items-center">
                        <div className="rounded-xl border border-zinc-800 px-4 py-3 text-center">
                          <p className="text-xl font-black text-orange-400">
                            {song.playCount}
                          </p>
                          <p className="text-xs text-zinc-500">Plays</p>
                        </div>

                        <div className="rounded-xl border border-zinc-800 px-4 py-3 text-center">
                          <p className="text-xl font-black text-orange-400">
                            {song.likeCount}
                          </p>
                          <p className="text-xs text-zinc-500">Likes</p>
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