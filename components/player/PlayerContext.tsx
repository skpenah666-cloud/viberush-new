"use client";

import {
  createContext,
  ReactNode,
  useContext,
  useMemo,
  useState,
} from "react";

export type PlayerSong = {
  id: string;
  title: string;
  artist: string;
  url: string;
  coverUrl?: string | null;
  userId?: string | null;
};

type PlayerContextType = {
  currentSong: PlayerSong | null;
  queue: PlayerSong[];
  isPlaying: boolean;
  playSong: (song: PlayerSong, queue?: PlayerSong[]) => void;
  playNext: () => void;
  playPrevious: () => void;
  pause: () => void;
  resume: () => void;
  clearPlayer: () => void;
};

const PlayerContext = createContext<PlayerContextType | null>(null);

export function PlayerProvider({ children }: { children: ReactNode }) {
  const [currentSong, setCurrentSong] = useState<PlayerSong | null>(null);
  const [queue, setQueue] = useState<PlayerSong[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const playSong = (song: PlayerSong, newQueue?: PlayerSong[]) => {
    const activeQueue = newQueue?.length ? newQueue : [song];
    const index = activeQueue.findIndex((item) => item.id === song.id);

    setQueue(activeQueue);
    setCurrentIndex(index >= 0 ? index : 0);
    setCurrentSong(song);
    setIsPlaying(true);
  };

  const playNext = () => {
    if (queue.length === 0) return;

    const nextIndex = currentIndex + 1 >= queue.length ? 0 : currentIndex + 1;
    const nextSong = queue[nextIndex];

    setCurrentIndex(nextIndex);
    setCurrentSong(nextSong);
    setIsPlaying(true);
  };

  const playPrevious = () => {
    if (queue.length === 0) return;

    const previousIndex =
      currentIndex - 1 < 0 ? queue.length - 1 : currentIndex - 1;

    const previousSong = queue[previousIndex];

    setCurrentIndex(previousIndex);
    setCurrentSong(previousSong);
    setIsPlaying(true);
  };

  const pause = () => {
    setIsPlaying(false);
  };

  const resume = () => {
    if (currentSong) setIsPlaying(true);
  };

  const clearPlayer = () => {
    setCurrentSong(null);
    setQueue([]);
    setCurrentIndex(0);
    setIsPlaying(false);
  };

  const value = useMemo(
    () => ({
      currentSong,
      queue,
      isPlaying,
      playSong,
      playNext,
      playPrevious,
      pause,
      resume,
      clearPlayer,
    }),
    [currentSong, queue, isPlaying]
  );

  return (
    <PlayerContext.Provider value={value}>
      {children}
    </PlayerContext.Provider>
  );
}

export function usePlayer() {
  const context = useContext(PlayerContext);

  if (!context) {
    throw new Error("usePlayer must be used inside PlayerProvider");
  }

  return context;
}