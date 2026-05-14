"use client";

import { useEffect, useState } from "react";

type NotificationPayload = {
  id: string;
  type: string;
  message: string;
  link?: string | null;
};

const typeIcon: Record<string, string> = {
  like: "❤️",
  comment: "💬",
  follow: "👤",
  upload: "🎵",
};

export default function RealtimeToast() {
  const [notification, setNotification] =
    useState<NotificationPayload | null>(null);

  useEffect(() => {
    const handleNotification = (event: Event) => {
      const customEvent = event as CustomEvent<NotificationPayload>;

      setNotification(customEvent.detail);

      setTimeout(() => {
        setNotification(null);
      }, 6000);
    };

    window.addEventListener(
      "viberush-notification",
      handleNotification
    );

    return () => {
      window.removeEventListener(
        "viberush-notification",
        handleNotification
      );
    };
  }, []);

  if (!notification) return null;

  return (
    <a
      href={notification.link || "/notifications"}
      className="fixed right-4 top-24 z-[80] w-[calc(100%-2rem)] max-w-sm rounded-3xl border border-orange-500/40 bg-black/95 p-4 text-white shadow-2xl shadow-orange-900/30 backdrop-blur-xl transition hover:bg-zinc-950 md:right-6"
    >
      <div className="flex gap-3">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-orange-500 text-xl text-black">
          {typeIcon[notification.type] || "🔔"}
        </div>

        <div className="min-w-0">
          <p className="text-xs font-black uppercase tracking-widest text-orange-400">
            New {notification.type}
          </p>

          <p className="mt-1 line-clamp-2 text-sm font-bold text-zinc-100">
            {notification.message}
          </p>

          <p className="mt-2 text-xs font-bold text-zinc-500">
            Tap to open
          </p>
        </div>
      </div>
    </a>
  );
}