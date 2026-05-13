"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import WaveformBars from "@/components/WaveformBars";

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
      headers: { Authorization: `Bearer ${token}` },
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
      body: JSON.stringify({ name: newPlaylistName.trim() }),
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

      if (currentSong?.id === id) setCurrentSong(null);
      setLikedSongIds((current) => current.filter((songId) => songId !== id));
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
      baseSongs = songs.filter((song) => likedSongIds.includes(song.id));
    }

    return baseSongs.filter((song) => {
      const text = `${song.title} ${song.artist}`.toLowerCase();
      return text.includes(search.toLowerCase());
    });
  }, [songs, search, view, userId, likedSongIds]);

  const myUploadCount = useMemo(() => {
    return songs.filter((song) => song.userId === userId).length;
  }, [songs, userId]);

  useEffect(() => {
    fetchUser();
    fetchSongs();
    fetchLikes();
    fetchPlaylists();
  }, []);

  return (
    <main className="min-h-screen bg-gradient-to-br from-black via-zinc-950 to-orange-950 pb-48 text-white md:pb-36">
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
              className="rounded-full border border-zinc-700 px-4 py-2 text-sm font-bold transition hover:bg-zinc-900 active:scale-95 md:px-5"
            >
              Login
            </a>
          )}

          <a
            href="/upload"
            className="rounded-full bg-orange-500 px-4 py-2 text-sm font-black text-black transition hover:bg-orange-400 active:scale-95 md:px-5"
          >
            Upload
          </a>
        </div>
      </nav>

      <section className="mx-auto max-w-6xl px-4 py-8 md:px-6 md:py-10">
        <div className="mb-8 rounded-3xl border border-zinc-800 bg-zinc-950/70 p-5 shadow-2xl md:p-8">
          <p className="text-sm font-bold uppercase tracking-widest text-orange-400">
            Music Vault
          </p>

          <div className="mt-3 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div>
              <h1 className="text-4xl font-black md:text-5xl">
                {view === "mine"
                  ? "My Uploads 🎙️"
                  : view === "favorites"
                    ? "Favorites ❤️"
                    : "Public Library 🎧"}
              </h1>

              <p className="mt-3 max-w-xl text-zinc-400">
                {view === "mine"
                  ? "Manage tracks uploaded under your account."
                  : view === "favorites"
                    ? "Your liked tracks in one place."
                    : "Stream, search, and discover music uploaded to VibeRush."}
              </p>
            </div>

            <div className="grid grid-cols-3 gap-2 md:gap-3">
              <div className="rounded-2xl border border-zinc-800 bg-black/70 px-3 py-4 text-right md:px-4">
                <p className="text-2xl font-black text-orange-400 md:text-3xl">
                  {songs.length}
                </p>
                <p className="text-xs uppercase tracking-widest text-zinc-500">
                  Public
                </p>
              </div>

              <div className="rounded-2xl border border-zinc-800 bg-black/70 px-3 py-4 text-right md:px-4">
                <p className="text-2xl font-black text-orange-400 md:text-3xl">
                  {userId ? myUploadCount : 0}
                </p>
                <p className="text-xs uppercase tracking-widest text-zinc-500">
                  Mine
                </p>
              </div>

              <div className="rounded-2xl border border-zinc-800 bg-black/70 px-3 py-4 text-right md:px-4">
                <p className="text-2xl font-black text-orange-400 md:text-3xl">
                  {likedSongIds.length}
                </p>
                <p className="text-xs uppercase tracking-widest text-zinc-500">
                  Likes
                </p>
              </div>
            </div>
          </div>

          <div className="mt-8 flex flex-col gap-3 md:flex-row">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by title or artist..."
              className="w-full rounded-2xl border border-zinc-800 bg-black p-4 text-white outline-none transition placeholder:text-zinc-600 focus:border-orange-500"
            />

            <div className="flex shrink-0 overflow-x-auto rounded-2xl border border-zinc-800 bg-black p-1">
              <button
                onClick={() => setView("public")}
                className={`rounded-xl px-4 py-3 text-sm font-black transition ${
                  view === "public"
                    ? "bg-orange-500 text-black"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                Public
              </button>

              <button
                onClick={() => setView("mine")}
                disabled={!userId}
                className={`rounded-xl px-4 py-3 text-sm font-black transition disabled:cursor-not-allowed disabled:opacity-40 ${
                  view === "mine"
                    ? "bg-orange-500 text-black"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                My Uploads
              </button>

              <button
                onClick={() => setView("favorites")}
                disabled={!userId}
                className={`rounded-xl px-4 py-3 text-sm font-black transition disabled:cursor-not-allowed disabled:opacity-40 ${
                  view === "favorites"
                    ? "bg-orange-500 text-black"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                Favorites
              </button>
            </div>
          </div>

          {userId && (
            <div className="mt-5 rounded-2xl border border-zinc-800 bg-black/70 p-4">
              <p className="mb-3 text-sm font-black uppercase tracking-widest text-orange-400">
                Playlists
              </p>

              <div className="grid gap-3 md:grid-cols-[1fr_auto]">
                <input
                  value={newPlaylistName}
                  onChange={(e) => setNewPlaylistName(e.target.value)}
                  placeholder="New playlist name..."
                  className="rounded-xl border border-zinc-800 bg-black p-3 text-white outline-none focus:border-orange-500"
                />

                <button
                  onClick={createPlaylist}
                  className="rounded-xl bg-orange-500 px-5 py-3 text-sm font-black text-black transition hover:bg-orange-400 active:scale-95"
                >
                  Create Playlist
                </button>
              </div>

              <select
                value={selectedPlaylistId}
                onChange={(e) => setSelectedPlaylistId(e.target.value)}
                className="mt-3 w-full rounded-xl border border-zinc-800 bg-black p-3 text-white outline-none focus:border-orange-500"
              >
                <option value="">Select playlist to add songs...</option>
                {playlists.map((playlist) => (
                  <option key={playlist.id} value={playlist.id}>
                    {playlist.name}
                  </option>
                ))}
              </select>

              {playlists.length > 0 && (
                <p className="mt-3 text-xs text-zinc-500">
                  Your playlists: {playlists.map((p) => p.name).join(", ")}
                </p>
              )}
            </div>
          )}

          {!userId && (
            <p className="mt-4 rounded-xl border border-orange-900 bg-orange-950/30 p-3 text-sm text-orange-200">
              Log in to view your uploads, favorite tracks, create playlists, and delete tracks you uploaded.
            </p>
          )}
        </div>

        {loading ? (
          <div className="rounded-3xl border border-zinc-800 bg-zinc-950/80 p-10 text-center">
            <p className="font-bold text-orange-300">Loading library...</p>
          </div>
        ) : songs.length === 0 ? (
          <div className="rounded-3xl border border-zinc-800 bg-zinc-950/80 p-10 text-center shadow-2xl">
            <h2 className="text-2xl font-black">No songs yet</h2>

            <p className="mt-2 text-zinc-400">
              Upload your first track and start building the catalog.
            </p>

            <a href="/upload">
              <button className="mt-6 rounded-full bg-orange-500 px-6 py-3 font-black text-black transition hover:bg-orange-400 active:scale-95">
                Upload Music
              </button>
            </a>
          </div>
        ) : visibleSongs.length === 0 ? (
          <div className="rounded-3xl border border-zinc-800 bg-zinc-950/80 p-10 text-center">
            <h2 className="text-2xl font-black">No matches found</h2>
            <p className="mt-2 text-zinc-400">
              {view === "favorites"
                ? "You have not liked any matching tracks yet."
                : view === "mine"
                  ? "You have not uploaded any matching tracks yet."
                  : "Try searching another song title or artist."}
            </p>
          </div>
        ) : (
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
                    {song.createdAt && (
                      <p className="mb-4 text-xs text-zinc-600">
                        Added {new Date(song.createdAt).toLocaleDateString()}
                      </p>
                    )}

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
                          {addingPlaylistSongId === song.id ? "..." : "+ Playlist"}
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
        )}
      </section>

      {currentSong && (
        <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-zinc-800 bg-black/95 p-3 shadow-2xl backdrop-blur-xl md:p-4">
          <div className="mx-auto flex max-w-6xl flex-col gap-4 md:flex-row md:items-center md:justify-between">
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