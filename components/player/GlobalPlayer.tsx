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
    <div className="fixed bottom-[82px] left-3 right-3 z-50 overflow-hidden rounded-3xl border border-zinc-800 bg-black/95 p-3 text-white shadow-2xl shadow-black/60 backdrop-blur-xl md:bottom-0 md:left-0 md:right-0 md:rounded-none md:border-x-0 md:border-b-0 md:p-4">
      <MusicVisualizer />

      <div className="relative mx-auto flex max-w-6xl flex-col gap-3 md:flex-row md:items-center md:justify-between md:gap-4">
        <div className="flex min-w-0 items-center gap-3">
          <div className="h-14 w-14 shrink-0 overflow-hidden rounded-2xl bg-zinc-900 md:h-14 md:w-14">
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

          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 md:text-xs">
              Now Playing
            </p>

            <h3 className="truncate text-sm font-black text-orange-300 md:text-base">
              {currentSong.title}
            </h3>

            <p className="truncate text-xs text-zinc-400 md:text-sm">
              {currentSong.artist}
            </p>
          </div>

          <button
            onClick={clearPlayer}
            className="rounded-full border border-zinc-700 px-3 py-2 text-xs font-black text-zinc-300 transition hover:bg-zinc-900 active:scale-95 md:hidden"
          >
            ✕
          </button>
        </div>

        <div className="flex flex-col gap-2 md:w-2/3 md:gap-3">
          <audio
            ref={audioRef}
            src={currentSong.url}
            controls
            autoPlay
            className="h-9 w-full rounded-xl md:h-auto"
            onPlay={resume}
            onPause={pause}
            onEnded={playNext}
          />

          <div className="flex items-center justify-center gap-2">
            <button
              onClick={playPrevious}
              className="rounded-full bg-zinc-800 px-4 py-2 text-xs font-black text-white transition hover:bg-zinc-700 active:scale-95 md:px-5 md:text-sm"
            >
              Prev
            </button>

            <button
              onClick={isPlaying ? pause : resume}
              className="rounded-full bg-orange-500 px-5 py-2 text-xs font-black text-black transition hover:bg-orange-400 active:scale-95 md:px-6 md:text-sm"
            >
              {isPlaying ? "Pause" : "Play"}
            </button>

            <button
              onClick={playNext}
              className="rounded-full bg-zinc-800 px-4 py-2 text-xs font-black text-white transition hover:bg-zinc-700 active:scale-95 md:px-5 md:text-sm"
            >
              Next
            </button>

            <button
              onClick={clearPlayer}
              className="hidden rounded-full border border-zinc-700 px-4 py-2 text-sm font-black text-zinc-300 transition hover:bg-zinc-900 active:scale-95 md:inline"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}