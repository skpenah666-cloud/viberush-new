"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import WaveformBars from "@/components/WaveformBars";
import MusicVisualizer from "@/components/MusicVisualizer";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type Song = {
  id: string;
  userId?: string | null;
  title: string;
  artist: string;
  url: string;
  fileName: string;
  coverUrl?: string | null;
  createdAt?: string;
};

type Playlist = {
  id: string;
  name: string;
  created_at?: string;
};

export default function LibraryPage() {
  const [songs, setSongs] = useState<Song[]>([]);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [selectedPlaylistId, setSelectedPlaylistId] = useState("");
  const [newPlaylistName, setNewPlaylistName] = useState("");
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [search, setSearch] = useState("");
  const [view, setView] = useState<"public" | "mine" | "favorites">("public");
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [likingId, setLikingId] = useState<string | null>(null);
  const [addingPlaylistSongId, setAddingPlaylistSongId] = useState<string | null>(null);
  const [likedSongIds, setLikedSongIds] = useState<string[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  const fetchUser = async () => {
    const { data } = await supabase.auth.getUser();
    setUserId(data.user?.id || null);
    setUserEmail(data.user?.email || null);
  };

  const getToken = async () => {
    const { data } = await supabase.auth.getSession();
    return data.session?.access_token || null;
  };

  const markRecentlyPlayed = async (songId: string) => {
    const token = await getToken();

    if (!token) return;

    await fetch("/api/recently-played", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ songId }),
    });
  };

  const playSong = async (song: Song) => {
    setCurrentSong(song);
    await markRecentlyPlayed(song.id);
  };

  const fetchPlaylists = async () => {
    const token = await getToken();

    if (!token) {
      setPlaylists([]);
      return;
    }

    const res = await fetch("/api/playlists", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await res.json();
    setPlaylists(data.playlists || []);
  };

  const createPlaylist = async () => {
    const token = await getToken();

    if (!token) {
      alert("Please log in to create playlists.");
      return;
    }

    if (!newPlaylistName.trim()) {
      alert("Enter a playlist name.");
      return;
    }

    const res = await fetch("/api/playlists", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        name: newPlaylistName.trim(),
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data?.error || "Could not create playlist.");
      return;
    }

    setNewPlaylistName("");
    await fetchPlaylists();
  };

  const addToPlaylist = async (songId: string) => {
    const token = await getToken();

    if (!token) {
      alert("Please log in to add songs to playlists.");
      return;
    }

    if (!selectedPlaylistId) {
      alert("Create or select a playlist first.");
      return;
    }

    setAddingPlaylistSongId(songId);

    try {
      const res = await fetch("/api/playlists/songs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          playlistId: selectedPlaylistId,
          songId,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data?.details || data?.error || "Could not add to playlist.");
        return;
      }

      alert("Added to playlist ✅");
    } finally {
      setAddingPlaylistSongId(null);
    }
  };

  const fetchLikes = async () => {
    const token = await getToken();

    if (!token) {
      setLikedSongIds([]);
      return;
    }

    try {
      const res = await fetch("/api/likes", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      setLikedSongIds(data.likedSongIds || []);
    } catch {
      setLikedSongIds([]);
    }
  };

  const fetchSongs = async () => {
    try {
      const res = await fetch("/api/upload");
      const data = await res.json();
      setSongs(data.songs || []);
    } catch {
      setSongs([]);
    } finally {
      setLoading(false);
    }
  };

  const toggleLike = async (songId: string) => {
    const token = await getToken();

    if (!token) {
      alert("Please log in to like songs.");
      return;
    }

    setLikingId(songId);

    try {
      const res = await fetch("/api/likes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ songId }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data?.error || "Like failed.");
        return;
      }

      setLikedSongIds((current) =>
        data.liked
          ? Array.from(new Set([...current, songId]))
          : current.filter((id) => id !== songId)
      );
    } finally {
      setLikingId(null);
    }
  };

  const deleteSong = async (id: string) => {
    const confirmDelete = confirm("Delete this track permanently?");
    if (!confirmDelete) return;

    const token = await getToken();

    if (!token) {
      alert("Please log in before deleting.");
      return;
    }

    setDeletingId(id);

    try {
      const res = await fetch("/api/upload", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ id }),
      });

      const result = await res.json();

      if (!res.ok) {
        alert(result?.error || "Delete failed.");
        return;
      }

      if (currentSong?.id === id) {
        setCurrentSong(null);
      }

      setLikedSongIds((current) =>
        current.filter((songId) => songId !== id)
      );

      await fetchSongs();
    } finally {
      setDeletingId(null);
    }
  };

  const visibleSongs = useMemo(() => {
    let baseSongs = songs;

    if (view === "mine") {
      baseSongs = songs.filter((song) => song.userId === userId);
    }

    if (view === "favorites") {
      baseSongs = songs.filter((song) =>
        likedSongIds.includes(song.id)
      );
    }

    return baseSongs.filter((song) => {
      const text = `${song.title} ${song.artist}`.toLowerCase();

      return text.includes(search.toLowerCase());
    });
  }, [songs, search, view, userId, likedSongIds]);

  useEffect(() => {
    fetchUser();
    fetchSongs();
    fetchLikes();
    fetchPlaylists();
  }, []);

  return (
    <main className="min-h-screen bg-gradient-to-br from-black via-zinc-950 to-orange-950 pb-48 text-white">
      <nav className="sticky top-0 z-20 flex items-center justify-between border-b border-zinc-900 bg-black/70 p-4 backdrop-blur-xl md:p-6">
        <a href="/" className="text-2xl font-black text-orange-500">
          VibeRush
        </a>

        <div className="flex items-center gap-2 md:gap-3">
          {userEmail ? (
            <span className="hidden rounded-full border border-zinc-800 px-4 py-2 text-xs font-bold text-zinc-400 md:inline">
              {userEmail}
            </span>
          ) : (
            <a
              href="/auth"
              className="rounded-full border border-zinc-700 px-4 py-2 text-sm font-bold transition hover:bg-zinc-900 active:scale-95"
            >
              Login
            </a>
          )}

          <a
            href="/upload"
            className="rounded-full bg-orange-500 px-4 py-2 text-sm font-black text-black transition hover:bg-orange-400 active:scale-95"
          >
            Upload
          </a>
        </div>
      </nav>

      <section className="mx-auto max-w-6xl px-4 py-8 md:px-6 md:py-10">
        <div className="grid gap-4 md:grid-cols-2 md:gap-5">
          {visibleSongs.map((song, index) => {
            const isOwner = userId && song.userId === userId;
            const isLiked = likedSongIds.includes(song.id);

            return (
              <div
                key={song.id}
                className={`overflow-hidden rounded-3xl border shadow-2xl transition hover:-translate-y-1 ${
                  currentSong?.id === song.id
                    ? "border-orange-500 bg-orange-950/30 shadow-orange-900/30"
                    : "border-zinc-800 bg-zinc-950/80 hover:shadow-orange-900/20"
                }`}
              >
                <div className="relative h-52 bg-zinc-900 md:h-56">
                  {song.coverUrl ? (
                    <img
                      src={song.coverUrl}
                      alt={`${song.title} cover`}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-orange-950 via-black to-zinc-900">
                      <div className="text-center">
                        <p className="text-5xl">🎧</p>

                        <p className="mt-3 text-sm font-bold uppercase tracking-widest text-orange-400">
                          VibeRush
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />

                  <div className="absolute bottom-4 left-4 right-4">
                    <div className="mb-2 flex items-center justify-between gap-3">
                      <p className="text-xs font-bold uppercase tracking-widest text-zinc-400">
                        Track {index + 1}
                      </p>

                      <div className="flex gap-2">
                        {isOwner && (
                          <span className="rounded-full bg-orange-500 px-3 py-1 text-xs font-black text-black">
                            Yours
                          </span>
                        )}

                        {isLiked && (
                          <span className="rounded-full bg-red-600 px-3 py-1 text-xs font-black text-white">
                            Liked
                          </span>
                        )}
                      </div>
                    </div>

                    <h2 className="truncate text-2xl font-black text-white">
                      {song.title}
                    </h2>

                    <p className="truncate text-sm text-orange-300">
                      {song.artist}
                    </p>
                  </div>
                </div>

                <div className="p-4 md:p-5">
                  <div className="space-y-3">
                    <WaveformBars />

                    <audio controls className="w-full rounded-xl">
                      <source src={song.url} />
                    </audio>
                  </div>

                  <div className="mt-5 flex flex-wrap gap-2">
                    <button
                      onClick={() => playSong(song)}
                      className="min-h-11 flex-1 rounded-full bg-orange-500 px-5 py-3 text-sm font-black text-black transition hover:bg-orange-400 active:scale-95"
                    >
                      Play
                    </button>

                    <button
                      onClick={() => toggleLike(song.id)}
                      disabled={likingId === song.id}
                      className={`min-h-11 rounded-full px-5 py-3 text-sm font-black transition active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 ${
                        isLiked
                          ? "bg-red-600 text-white hover:bg-red-500"
                          : "bg-zinc-800 text-white hover:bg-zinc-700"
                      }`}
                    >
                      {isLiked ? "❤️" : "♡"}
                    </button>

                    {song.userId && (
                      <a
                        href={`/artist/${song.userId}`}
                        className="min-h-11 rounded-full bg-zinc-800 px-5 py-3 text-sm font-black text-white transition hover:bg-zinc-700 active:scale-95"
                      >
                        Artist
                      </a>
                    )}

                    {userId && (
                      <button
                        onClick={() => addToPlaylist(song.id)}
                        disabled={addingPlaylistSongId === song.id}
                        className="min-h-11 rounded-full bg-zinc-800 px-5 py-3 text-sm font-black text-white transition hover:bg-zinc-700 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {addingPlaylistSongId === song.id
                          ? "..."
                          : "+ Playlist"}
                      </button>
                    )}

                    {isOwner && (
                      <button
                        onClick={() => deleteSong(song.id)}
                        disabled={deletingId === song.id}
                        className="min-h-11 rounded-full bg-red-600 px-5 py-3 text-sm font-black text-white transition hover:bg-red-500 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {deletingId === song.id ? "..." : "Delete"}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {currentSong && (
        <div className="fixed bottom-0 left-0 right-0 z-40 overflow-hidden border-t border-zinc-800 bg-black/95 p-3 shadow-2xl backdrop-blur-xl md:p-4">
          <MusicVisualizer />

          <div className="relative mx-auto flex max-w-6xl flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex min-w-0 items-center gap-3">
              <div className="h-16 w-16 shrink-0 overflow-hidden rounded-2xl bg-zinc-900 md:h-14 md:w-14">
                {currentSong.coverUrl ? (
                  <img
                    src={currentSong.coverUrl}
                    alt={`${currentSong.title} cover`}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-xl">
                    🎧
                  </div>
                )}
              </div>

              <div className="min-w-0">
                <p className="text-xs font-bold uppercase tracking-widest text-zinc-500">
                  Now Playing
                </p>

                <h3 className="truncate font-black text-orange-300">
                  {currentSong.title}
                </h3>

                <p className="truncate text-sm text-zinc-400">
                  {currentSong.artist}
                </p>
              </div>
            </div>

            <audio controls autoPlay className="w-full rounded-xl md:w-2/3">
              <source src={currentSong.url} />
            </audio>
          </div>
        </div>
      )}
    </main>
  );
}