"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import WaveformBars from "@/components/WaveformBars";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type Profile = {
  id: string;
  username: string;
  display_name?: string | null;
  bio?: string | null;
  avatar_url?: string | null;
  instagram?: string | null;
  twitter?: string | null;
  website?: string | null;
};

type Song = {
  id: string;
  title: string;
  artist: string;
  url: string;
  cover_url?: string | null;
  genre?: string | null;
  created_at?: string;
};

export default function PublicProfilePage({
  params,
}: {
  params: { username: string };
}) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [songs, setSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("username", params.username)
        .maybeSingle();

      if (!profileData) {
        setLoading(false);
        return;
      }

      setProfile(profileData);

      const { data: songData } = await supabase
        .from("songs")
        .select("*")
        .eq("user_id", profileData.id)
        .order("created_at", { ascending: false });

      setSongs(songData || []);
      setLoading(false);
    };

    fetchProfile();
  }, [params.username]);

  return (
    <main className="min-h-screen bg-gradient-to-br from-black via-zinc-950 to-orange-950 pb-24 text-white">
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
        {loading ? (
          <div className="rounded-3xl border border-zinc-800 bg-zinc-950/80 p-10 text-center text-orange-300">
            Loading profile...
          </div>
        ) : !profile ? (
          <div className="rounded-3xl border border-zinc-800 bg-zinc-950/80 p-10 text-center">
            <h1 className="text-3xl font-black">Profile not found</h1>

            <a
              href="/discover"
              className="mt-6 inline-block rounded-full bg-orange-500 px-6 py-3 font-black text-black"
            >
              Discover Music
            </a>
          </div>
        ) : (
          <>
            <div className="mb-8 overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-950/80 shadow-2xl">
              <div className="relative min-h-72 bg-gradient-to-br from-orange-950 via-black to-zinc-950 p-6 md:p-8">
                <div className="absolute left-10 top-10 h-56 w-56 rounded-full bg-orange-500/10 blur-3xl" />
                <div className="absolute bottom-0 right-10 h-56 w-56 rounded-full bg-red-500/10 blur-3xl" />

                <div className="relative flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
                  <div className="flex flex-col gap-5 md:flex-row md:items-center">
                    <div className="h-32 w-32 overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-900 shadow-2xl">
                      {profile.avatar_url ? (
                        <img
                          src={profile.avatar_url}
                          alt={`${profile.display_name || profile.username} avatar`}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-5xl">
                          👤
                        </div>
                      )}
                    </div>

                    <div>
                      <p className="text-sm font-bold uppercase tracking-widest text-orange-400">
                        Creator Profile
                      </p>

                      <h1 className="mt-2 text-5xl font-black">
                        {profile.display_name || profile.username}
                      </h1>

                      <p className="mt-2 text-orange-300">
                        @{profile.username}
                      </p>

                      {profile.bio && (
                        <p className="mt-4 max-w-xl text-zinc-300">
                          {profile.bio}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="rounded-2xl border border-zinc-800 bg-black/60 px-5 py-4 text-right">
                    <p className="text-3xl font-black text-orange-400">
                      {songs.length}
                    </p>

                    <p className="text-xs uppercase tracking-widest text-zinc-500">
                      Tracks
                    </p>
                  </div>
                </div>

                <div className="relative mt-6 flex flex-wrap gap-3">
                  {profile.instagram && (
                    <a
                      href={profile.instagram}
                      target="_blank"
                      className="rounded-full bg-zinc-800 px-5 py-3 text-sm font-black text-white transition hover:bg-zinc-700"
                    >
                      Instagram
                    </a>
                  )}

                  {profile.twitter && (
                    <a
                      href={profile.twitter}
                      target="_blank"
                      className="rounded-full bg-zinc-800 px-5 py-3 text-sm font-black text-white transition hover:bg-zinc-700"
                    >
                      X / Twitter
                    </a>
                  )}

                  {profile.website && (
                    <a
                      href={profile.website}
                      target="_blank"
                      className="rounded-full bg-orange-500 px-5 py-3 text-sm font-black text-black transition hover:bg-orange-400"
                    >
                      Website
                    </a>
                  )}
                </div>
              </div>
            </div>

            {songs.length === 0 ? (
              <div className="rounded-3xl border border-zinc-800 bg-zinc-950/80 p-10 text-center">
                <h2 className="text-2xl font-black">No tracks yet</h2>
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
                        <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-orange-950 via-black to-zinc-900 text-5xl">
                          🎧
                        </div>
                      )}

                      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />

                      <div className="absolute left-4 top-4 rounded-full bg-orange-500 px-3 py-1 text-xs font-black text-black">
                        {song.genre || "Other"}
                      </div>

                      <div className="absolute bottom-4 left-4 right-4">
                        <p className="text-xs font-bold uppercase tracking-widest text-zinc-400">
                          Track {index + 1}
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
          </>
        )}
      </section>
    </main>
  );
}