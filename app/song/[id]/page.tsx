"use client";

import { useEffect, useRef, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import WaveformBars from "@/components/WaveformBars";
import LiveListeners from "@/components/LiveListeners";
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
  created_at?: string;
};

type Comment = {
  id: string;
  song_id?: string;
  user_email?: string | null;
  body: string;
  created_at?: string;
};

export default function SongPage({
  params,
}: {
  params: { id: string };
}) {
  const [song, setSong] = useState<Song | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentBody, setCommentBody] = useState("");
  const [message, setMessage] = useState("");
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [likeLoading, setLikeLoading] = useState(false);

  const realtimeChannelRef =
    useRef<ReturnType<typeof supabase.channel> | null>(
      null
    );

  const likesRealtimeRef =
    useRef<ReturnType<typeof supabase.channel> | null>(
      null
    );

  const { currentSong, playSong: startPlayer } =
    usePlayer();

  const getToken = async () => {
    const { data } = await supabase.auth.getSession();
    return data.session?.access_token || null;
  };

  const fetchSong = async () => {
    const { data } = await supabase
      .from("songs")
      .select("*")
      .eq("id", params.id)
      .single();

    setSong(data || null);
    setLoading(false);
  };

  const fetchUser = async () => {
    const { data } = await supabase.auth.getUser();

    setUserEmail(data.user?.email || null);
  };

  const fetchComments = async () => {
    const res = await fetch(
      `/api/comments?songId=${params.id}`
    );

    const data = await res.json();

    setComments(data.comments || []);
  };

  const fetchLikes = async () => {
    const token = await getToken();

    const res = await fetch(
      `/api/likes?songId=${params.id}`,
      {
        headers: token
          ? {
              Authorization: `Bearer ${token}`,
            }
          : {},
      }
    );

    const data = await res.json();

    setLiked(Boolean(data.liked));
    setLikeCount(data.likeCount || 0);
  };

  const toggleLike = async () => {
    const token = await getToken();

    if (!token) {
      setMessage("Please log in to like songs.");
      return;
    }

    setLikeLoading(true);

    try {
      const res = await fetch("/api/likes", {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },

        body: JSON.stringify({
          songId: params.id,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(data?.error || "Like failed.");
        return;
      }

      setLiked(Boolean(data.liked));
      setLikeCount(data.likeCount || 0);
    } finally {
      setLikeLoading(false);
    }
  };

  const addComment = async () => {
    if (!commentBody.trim()) return;

    const token = await getToken();

    if (!token) {
      setMessage("Please log in to comment.");
      return;
    }

    const res = await fetch("/api/comments", {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },

      body: JSON.stringify({
        songId: params.id,
        body: commentBody,
      }),
    });

    const result = await res.json();

    if (!res.ok) {
      setMessage(result?.error || "Comment failed.");
      return;
    }

    setCommentBody("");
    setMessage("Comment posted ✅");
  };

  const playSong = () => {
    if (!song) return;

    startPlayer({
      id: song.id,
      title: song.title,
      artist: song.artist,
      url: song.url,
      coverUrl: song.cover_url,
      userId: song.user_id,
    });
  };

  useEffect(() => {
    fetchSong();
    fetchUser();
    fetchComments();
    fetchLikes();
  }, [params.id]);

  useEffect(() => {
    if (realtimeChannelRef.current) {
      supabase.removeChannel(realtimeChannelRef.current);
    }

    const channel = supabase
      .channel(`song-comments-${params.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "comments",
          filter: `song_id=eq.${params.id}`,
        },
        (payload) => {
          const newComment = payload.new as Comment;

          setComments((prev) => {
            const exists = prev.some(
              (comment) => comment.id === newComment.id
            );

            if (exists) return prev;

            return [newComment, ...prev];
          });
        }
      )
      .subscribe();

    realtimeChannelRef.current = channel;

    return () => {
      if (realtimeChannelRef.current) {
        supabase.removeChannel(
          realtimeChannelRef.current
        );
      }
    };
  }, [params.id]);

  useEffect(() => {
    if (likesRealtimeRef.current) {
      supabase.removeChannel(likesRealtimeRef.current);
    }

    const channel = supabase
      .channel(`song-likes-${params.id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "likes",
          filter: `song_id=eq.${params.id}`,
        },
        () => {
          fetchLikes();
        }
      )
      .subscribe();

    likesRealtimeRef.current = channel;

    return () => {
      if (likesRealtimeRef.current) {
        supabase.removeChannel(
          likesRealtimeRef.current
        );
      }
    };
  }, [params.id]);

  const isCurrentSong = currentSong?.id === song?.id;

  return (
    <main className="min-h-screen bg-gradient-to-br from-black via-zinc-950 to-orange-950 pb-40 text-white">
      <nav className="sticky top-0 z-20 flex items-center justify-between border-b border-zinc-900 bg-black/70 p-4 backdrop-blur-xl md:p-6">
        <a
          href="/"
          className="text-2xl font-black text-orange-500"
        >
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
            href="/trending"
            className="rounded-full bg-orange-500 px-4 py-2 text-sm font-black text-black transition hover:bg-orange-400"
          >
            Trending
          </a>
        </div>
      </nav>

      <section className="mx-auto max-w-5xl px-4 py-8 md:px-6 md:py-10">
        {loading ? (
          <div className="rounded-3xl border border-zinc-800 bg-zinc-950/80 p-10 text-center text-orange-300">
            Loading song...
          </div>
        ) : !song ? (
          <div className="rounded-3xl border border-zinc-800 bg-zinc-950/80 p-10 text-center">
            <h1 className="text-3xl font-black">
              Song not found
            </h1>

            <a
              href="/library"
              className="mt-6 inline-block rounded-full bg-orange-500 px-6 py-3 font-black text-black"
            >
              Back to Library
            </a>
          </div>
        ) : (
          <>
            <div
              className={`overflow-hidden rounded-3xl border shadow-2xl ${
                isCurrentSong
                  ? "border-orange-500 bg-orange-950/30"
                  : "border-zinc-800 bg-zinc-950/80"
              }`}
            >
              <div className="relative h-80 bg-zinc-900 md:h-96">
                {song.cover_url ? (
                  <img
                    src={song.cover_url}
                    alt={`${song.title} cover`}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-orange-950 via-black to-zinc-900 text-7xl">
                    🎧
                  </div>
                )}

                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />

                {isCurrentSong && (
                  <div className="absolute right-6 top-6 rounded-full bg-green-500 px-4 py-2 text-sm font-black text-black">
                    Playing
                  </div>
                )}

                <div className="absolute bottom-6 left-6 right-6">
                  <div className="flex flex-wrap items-center gap-3">
                    <p className="text-sm font-bold uppercase tracking-widest text-orange-400">
                      Public Track
                    </p>

                    <LiveListeners songId={song.id} />

                    <div className="rounded-full border border-pink-500/40 bg-pink-950/30 px-4 py-2 text-xs font-black text-pink-300">
                      ❤️ {likeCount} like
                      {likeCount === 1 ? "" : "s"}
                    </div>
                  </div>

                  <h1 className="mt-3 text-5xl font-black">
                    {song.title}
                  </h1>

                  <p className="mt-2 text-lg text-orange-300">
                    {song.artist}
                  </p>
                </div>
              </div>

              <div className="space-y-5 p-5 md:p-6">
                <WaveformBars />

                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={playSong}
                    className="rounded-full bg-orange-500 px-6 py-3 text-sm font-black text-black transition hover:bg-orange-400"
                  >
                    {isCurrentSong
                      ? "Playing"
                      : "Play Song"}
                  </button>

                  <button
                    onClick={toggleLike}
                    disabled={likeLoading}
                    className={`rounded-full px-6 py-3 text-sm font-black transition active:scale-95 ${
                      liked
                        ? "bg-pink-500 text-white hover:bg-pink-400"
                        : "bg-zinc-800 text-white hover:bg-zinc-700"
                    }`}
                  >
                    {liked ? "❤️ Liked" : "🤍 Like"}
                  </button>

                  {song.user_id && (
                    <a
                      href={`/artist/${song.user_id}`}
                      className="rounded-full bg-zinc-800 px-5 py-3 text-sm font-black text-white transition hover:bg-zinc-700"
                    >
                      View Artist
                    </a>
                  )}

                  <a
                    href="/library"
                    className="rounded-full bg-zinc-800 px-5 py-3 text-sm font-black text-white transition hover:bg-zinc-700"
                  >
                    Back to Library
                  </a>
                </div>
              </div>
            </div>

            <div className="mt-8 rounded-3xl border border-zinc-800 bg-zinc-950/80 p-5 shadow-2xl md:p-6">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-bold uppercase tracking-widest text-orange-400">
                    Live Comments
                  </p>

                  <p className="mt-1 text-xs text-zinc-500">
                    Realtime discussion enabled
                  </p>
                </div>

                <div className="rounded-full bg-green-500 px-4 py-2 text-xs font-black text-black">
                  LIVE
                </div>
              </div>

              {userEmail ? (
                <p className="mt-4 text-sm text-zinc-500">
                  Commenting as {userEmail}
                </p>
              ) : (
                <p className="mt-4 text-sm text-orange-300">
                  Log in to leave a comment.
                </p>
              )}

              <textarea
                value={commentBody}
                onChange={(e) =>
                  setCommentBody(e.target.value)
                }
                placeholder="Write a comment..."
                className="mt-5 min-h-28 w-full rounded-2xl border border-zinc-800 bg-black p-4 text-white outline-none focus:border-orange-500"
              />

              <button
                onClick={addComment}
                className="mt-4 rounded-full bg-orange-500 px-6 py-3 font-black text-black transition hover:bg-orange-400 active:scale-95"
              >
                Post Comment
              </button>

              {message && (
                <p className="mt-4 text-sm font-bold text-green-400">
                  {message}
                </p>
              )}

              <div className="mt-8 grid gap-4">
                {comments.length === 0 ? (
                  <p className="text-zinc-500">
                    No comments yet.
                  </p>
                ) : (
                  comments.map((comment) => (
                    <div
                      key={comment.id}
                      className="rounded-2xl border border-zinc-800 bg-black/60 p-4"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <p className="truncate text-xs font-bold text-orange-400">
                          {comment.user_email ||
                            "VibeRush user"}
                        </p>

                        <span className="rounded-full bg-green-500 px-2 py-1 text-[10px] font-black text-black">
                          LIVE
                        </span>
                      </div>

                      <p className="mt-2 text-zinc-200">
                        {comment.body}
                      </p>

                      {comment.created_at && (
                        <p className="mt-3 text-xs text-zinc-600">
                          {new Date(
                            comment.created_at
                          ).toLocaleString()}
                        </p>
                      )}
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