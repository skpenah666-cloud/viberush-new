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
  const [followerCount, setFollowerCount] = useState(0);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  const fetchUser = async () => {
    const { data } = await supabase.auth.getUser();
    setUserEmail(data.user?.email || null);
  };

  const getToken = async () => {
    const { data } = await supabase.auth.getSession();
    return data.session?.access_token || null;
  };

  const fetchArtistSongs = async () => {
    const { data } = await supabase
      .from("songs")
      .select("*")
      .eq("user_id", params.id)
      .order("created_at", { ascending: false });

    setSongs(data || []);
    setLoading(false);
  };

  const fetchFollowStatus = async () => {
    const token = await getToken();

    const res = await fetch(`/api/follows?artistId=${params.id}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });

    const data = await res.json();

    setFollowerCount(data.followerCount || 0);
    setIsFollowing(Boolean(data.isFollowing));
  };

  const toggleFollow = async () => {
    const token = await getToken();

    if (!token) {
      alert("Please log in to follow artists.");
      return;
    }

    setFollowLoading(true);

    try {
      const res = await fetch("/api/follows", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          artistId: params.id,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data?.error || "Follow failed.");
        return;
      }

      setIsFollowing(Boolean(data.isFollowing));
      await fetchFollowStatus();
    } finally {
      setFollowLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
    fetchArtistSongs();
    fetchFollowStatus();
  }, [params.id]);

  const artistName = songs[0]?.artist || "Artist";

  return (
    <main className="min-h-screen bg-gradient-to-br from-black via-zinc-950 to-orange-950 pb-24 text-white">
      <nav className="sticky top-0 z-20 flex items-center justify-between border-b border-zinc-900 bg-black/70 p-4 backdrop-blur-xl md:p-6">
        <a href="/" className="text-2xl font-black text-orange-500">
          VibeRush
        </a>

        <div className="flex items-center gap-2 md:gap-3">
          {userEmail && (
            <span className="hidden rounded-full border border-zinc-800 px-4 py-2 text-xs font-bold text-zinc-400 md:inline">
              {userEmail}
            </span>
          )}

          <a
            href="/library"
            className="rounded-full border border-zinc-700 px-4 py-2 text-sm font-bold text-white transition hover:bg-zinc-900"
          >
            Library
          </a>

          <a
            href="/dashboard"
            className="rounded-full bg-orange-500 px-4 py-2 text-sm font-black text-black transition hover:bg-orange-400"
          >
            Dashboard
          </a>
        </div>
      </nav>

      <section className="mx-auto max-w-6xl px-4 py-8 md:px-6 md:py-10">
        <div className="mb-8 rounded-3xl border border-zinc-800 bg-zinc-950/80 p-6 shadow-2xl md:p-8">
          <p className="text-sm font-bold uppercase tracking-widest text-orange-400">
            Artist Profile
          </p>

          <div className="mt-3 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <div>
              <h1 className="text-5xl font-black">{artistName}</h1>

              <p className="mt-3 text-zinc-400">
                {loading
                  ? "Loading artist catalog..."
                  : `${songs.length} track${
                      songs.length === 1 ? "" : "s"
                    } uploaded`}
              </p>

              <p className="mt-2 text-sm font-bold text-orange-300">
                {followerCount} follower{followerCount === 1 ? "" : "s"}
              </p>
            </div>

            <button
              onClick={toggleFollow}
              disabled={followLoading}
              className={`rounded-full px-6 py-3 text-sm font-black transition active:scale-95 disabled:cursor-not-allowed disabled:opacity-60 ${
                isFollowing
                  ? "border border-zinc-700 bg-zinc-900 text-white hover:bg-zinc-800"
                  : "bg-orange-500 text-black hover:bg-orange-400"
              }`}
            >
              {followLoading
                ? "Please wait..."
                : isFollowing
                  ? "Following"
                  : "Follow Artist"}
            </button>
          </div>
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
                className="overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-950/80 shadow-2xl transition hover:-translate-y-1 hover:shadow-orange-900/20"
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

                <div className="space-y-4 p-5">
                  <audio controls className="w-full rounded-xl">
                    <source src={song.url} />
                  </audio>

                  <a
                    href={`/song/${song.id}`}
                    className="inline-block rounded-full bg-orange-500 px-5 py-3 text-sm font-black text-black transition hover:bg-orange-400"
                  >
                    Open Song
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}