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
  user_id?: string | null;
  cover_url?: string | null;
  created_at?: string;
};

type Comment = {
  id: string;
  song_id: string;
  user_email?: string | null;
  body: string;
  created_at?: string;
};

type Follow = {
  id: string;
  follower_id: string;
  artist_id: string;
  created_at?: string;
};

type ActivityItem = {
  id: string;
  type: "upload" | "comment" | "follow";
  title: string;
  subtitle: string;
  link: string;
  time?: string;
  icon: string;
};

export default function ActivityPage() {
  const [songs, setSongs] = useState<Song[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [follows, setFollows] = useState<Follow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchActivity = async () => {
      const { data: songsData } = await supabase
        .from("songs")
        .select("id, title, artist, user_id, cover_url, created_at")
        .order("created_at", { ascending: false })
        .limit(20);

      const { data: commentsData } = await supabase
        .from("comments")
        .select("id, song_id, user_email, body, created_at")
        .order("created_at", { ascending: false })
        .limit(20);

      const { data: followsData } = await supabase
        .from("follows")
        .select("id, follower_id, artist_id, created_at")
        .order("created_at", { ascending: false })
        .limit(20);

      setSongs(songsData || []);
      setComments(commentsData || []);
      setFollows(followsData || []);
      setLoading(false);
    };

    fetchActivity();
  }, []);

  const activityItems = useMemo<ActivityItem[]>(() => {
    const uploads: ActivityItem[] = songs.map((song) => ({
      id: `upload-${song.id}`,
      type: "upload",
      title: `${song.artist} uploaded "${song.title}"`,
      subtitle: "New music just dropped on VibeRush.",
      link: `/song/${song.id}`,
      time: song.created_at,
      icon: "🎵",
    }));

    const commentItems: ActivityItem[] = comments.map((comment) => ({
      id: `comment-${comment.id}`,
      type: "comment",
      title: `${comment.user_email || "Someone"} commented on a track`,
      subtitle:
        comment.body.length > 80
          ? `${comment.body.slice(0, 80)}...`
          : comment.body,
      link: `/song/${comment.song_id}`,
      time: comment.created_at,
      icon: "💬",
    }));

    const followItems: ActivityItem[] = follows.map((follow) => ({
      id: `follow-${follow.id}`,
      type: "follow",
      title: "An artist gained a new follower",
      subtitle: "The VibeRush creator network is growing.",
      link: `/artist/${follow.artist_id}`,
      time: follow.created_at,
      icon: "🔥",
    }));

    return [...uploads, ...commentItems, ...followItems].sort((a, b) => {
      const aTime = a.time ? new Date(a.time).getTime() : 0;
      const bTime = b.time ? new Date(b.time).getTime() : 0;
      return bTime - aTime;
    });
  }, [songs, comments, follows]);

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
            href="/trending"
            className="rounded-full border border-zinc-700 px-4 py-2 text-sm font-bold transition hover:bg-zinc-900"
          >
            Trending
          </a>

          <a
            href="/library"
            className="rounded-full bg-orange-500 px-4 py-2 text-sm font-black text-black transition hover:bg-orange-400"
          >
            Library
          </a>
        </div>
      </nav>

      <section className="mx-auto max-w-5xl px-4 py-8 md:px-6 md:py-10">
        <div className="mb-8 rounded-3xl border border-zinc-800 bg-zinc-950/80 p-6 shadow-2xl md:p-8">
          <p className="text-sm font-bold uppercase tracking-widest text-orange-400">
            Live Platform Energy
          </p>

          <h1 className="mt-3 text-5xl font-black">Activity Feed ⚡</h1>

          <p className="mt-3 max-w-xl text-zinc-400">
            See what is happening across VibeRush — new drops, comments,
            follows, and creator momentum.
          </p>

          <div className="mt-6 grid gap-3 md:grid-cols-3">
            <div className="rounded-2xl border border-zinc-800 bg-black/60 p-4">
              <p className="text-3xl font-black text-orange-400">
                {songs.length}
              </p>
              <p className="text-xs uppercase tracking-widest text-zinc-500">
                Recent Uploads
              </p>
            </div>

            <div className="rounded-2xl border border-zinc-800 bg-black/60 p-4">
              <p className="text-3xl font-black text-orange-400">
                {comments.length}
              </p>
              <p className="text-xs uppercase tracking-widest text-zinc-500">
                Recent Comments
              </p>
            </div>

            <div className="rounded-2xl border border-zinc-800 bg-black/60 p-4">
              <p className="text-3xl font-black text-orange-400">
                {follows.length}
              </p>
              <p className="text-xs uppercase tracking-widest text-zinc-500">
                Recent Follows
              </p>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="rounded-3xl border border-zinc-800 bg-zinc-950/80 p-10 text-center text-orange-300">
            Loading activity...
          </div>
        ) : activityItems.length === 0 ? (
          <div className="rounded-3xl border border-zinc-800 bg-zinc-950/80 p-10 text-center">
            <h2 className="text-2xl font-black">No activity yet</h2>
            <p className="mt-2 text-zinc-400">
              Upload songs, follow artists, and comment to create activity.
            </p>
          </div>
        ) : (
          <div className="grid gap-4">
            {activityItems.map((item) => (
              <a
                key={item.id}
                href={item.link}
                className="group rounded-3xl border border-zinc-800 bg-zinc-950/80 p-5 shadow-2xl transition hover:-translate-y-1 hover:border-orange-500 hover:bg-orange-950/20"
              >
                <div className="flex gap-4">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-black text-2xl ring-1 ring-zinc-800 group-hover:ring-orange-500">
                    {item.icon}
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold uppercase tracking-widest text-orange-400">
                      {item.type}
                    </p>

                    <h2 className="mt-1 text-lg font-black text-white">
                      {item.title}
                    </h2>

                    <p className="mt-1 line-clamp-2 text-sm text-zinc-400">
                      {item.subtitle}
                    </p>

                    {item.time && (
                      <p className="mt-3 text-xs text-zinc-600">
                        {new Date(item.time).toLocaleString()}
                      </p>
                    )}
                  </div>

                  <div className="hidden items-center text-sm font-black text-orange-400 md:flex">
                    Open →
                  </div>
                </div>
              </a>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}