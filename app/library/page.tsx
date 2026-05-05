"use client";

import { useEffect, useState } from "react";

type Song = {
  id: string;
  title: string;
  artist: string;
  url: string;
  fileName: string;
};

export default function LibraryPage() {
  const [songs, setSongs] = useState<Song[]>([]);
  const [currentSong, setCurrentSong] = useState<Song | null>(null);

  const fetchSongs = async () => {
    const res = await fetch("/api/upload");
    const data = await res.json();
    setSongs(data.songs || []);
  };

  const deleteSong = async (id: string) => {
    await fetch("/api/upload", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id }),
    });

    if (currentSong?.id === id) setCurrentSong(null);
    fetchSongs();
  };

  useEffect(() => {
    fetchSongs();
  }, []);

  return (
    <main className="min-h-screen bg-gradient-to-br from-black via-zinc-950 to-orange-950 pb-32 text-white">
      <nav className="flex items-center justify-between p-6">
        <a href="/" className="text-2xl font-bold text-orange-500">
          VibeRush
        </a>

        <a
          href="/upload"
          className="rounded-full bg-orange-500 px-5 py-2 text-sm font-bold text-black transition hover:bg-orange-400 active:scale-95"
        >
          Upload
        </a>
      </nav>

      <section className="mx-auto max-w-5xl px-6 py-10">
        <div className="mb-10">
          <p className="text-sm font-bold uppercase tracking-widest text-orange-400">
            Music Vault
          </p>

          <h1 className="mt-2 text-5xl font-black">Your Library 🎧</h1>

          <p className="mt-3 max-w-xl text-zinc-400">
            Manage your tracks, play your catalog, and control your sound.
          </p>
        </div>

        {songs.length === 0 ? (
          <div className="rounded-3xl border border-zinc-800 bg-zinc-950/80 p-10 text-center">
            <h2 className="text-2xl font-bold">No songs yet</h2>

            <p className="mt-2 text-zinc-400">
              Upload your first track and it will appear here.
            </p>

            <a href="/upload">
              <button className="mt-6 rounded-full bg-orange-500 px-6 py-3 font-bold text-black transition hover:bg-orange-400 active:scale-95">
                Upload Music
              </button>
            </a>
          </div>
        ) : (
          <div className="grid gap-5">
            {songs.map((song, index) => (
              <div
                key={song.id}
                className="rounded-3xl border border-zinc-800 bg-zinc-950/80 p-5 shadow-2xl transition hover:-translate-y-1 hover:shadow-orange-900/20"
              >
                <div className="mb-4 flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm text-zinc-500">
                      Track {index + 1}
                    </p>

                    <h2 className="break-all text-xl font-bold text-orange-300">
                      {song.title}
                    </h2>

                    <p className="text-sm text-zinc-400">
                      {song.artist}
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => setCurrentSong(song)}
                      className="rounded-full bg-orange-500 px-4 py-2 text-sm font-bold text-black transition hover:bg-orange-400 active:scale-95"
                    >
                      Play
                    </button>

                    <button
                      onClick={() => deleteSong(song.id)}
                      className="rounded-full bg-red-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-red-500 active:scale-95"
                    >
                      Delete
                    </button>
                  </div>
                </div>

                <audio controls className="w-full">
                  <source src={song.url} />
                </audio>
              </div>
            ))}
          </div>
        )}
      </section>

      {currentSong && (
        <div className="fixed bottom-0 left-0 right-0 border-t border-zinc-800 bg-black/95 p-4 backdrop-blur">
          <div className="mx-auto flex max-w-5xl flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm text-zinc-500">Now Playing</p>
              <h3 className="font-bold text-orange-300">
                {currentSong.title}
              </h3>
              <p className="text-sm text-zinc-400">
                {currentSong.artist}
              </p>
            </div>

            <audio controls autoPlay className="w-full md:w-2/3">
              <source src={currentSong.url} />
            </audio>
          </div>
        </div>
      )}
    </main>
  );
}