"use client";

import { useEffect, useRef } from "react";
import MusicVisualizer from "@/components/MusicVisualizer";
import { usePlayer } from "@/components/player/PlayerContext";

export default function GlobalPlayer() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const {
    currentSong,
    isPlaying,
    playNext,
    playPrevious,
    pause,
    resume,
    clearPlayer,
  } = usePlayer();

  useEffect(() => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.play().catch(() => {});
    } else {
      audioRef.current.pause();
    }
  }, [isPlaying, currentSong]);

  if (!currentSong) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 overflow-hidden border-t border-zinc-800 bg-black/95 p-3 text-white shadow-2xl backdrop-blur-xl md:p-4">
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

        <div className="flex flex-col gap-3 md:w-2/3">
          <audio
            ref={audioRef}
            src={currentSong.url}
            controls
            autoPlay
            className="w-full rounded-xl"
            onPlay={resume}
            onPause={pause}
            onEnded={playNext}
          />

          <div className="flex items-center justify-center gap-2">
            <button
              onClick={playPrevious}
              className="rounded-full bg-zinc-800 px-5 py-2 text-sm font-black text-white transition hover:bg-zinc-700 active:scale-95"
            >
              Prev
            </button>

            <button
              onClick={isPlaying ? pause : resume}
              className="rounded-full bg-orange-500 px-6 py-2 text-sm font-black text-black transition hover:bg-orange-400 active:scale-95"
            >
              {isPlaying ? "Pause" : "Play"}
            </button>

            <button
              onClick={playNext}
              className="rounded-full bg-zinc-800 px-5 py-2 text-sm font-black text-white transition hover:bg-zinc-700 active:scale-95"
            >
              Next
            </button>

            <button
              onClick={clearPlayer}
              className="rounded-full border border-zinc-700 px-4 py-2 text-sm font-black text-zinc-300 transition hover:bg-zinc-900 active:scale-95"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}