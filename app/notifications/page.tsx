"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type Notification = {
  id: string;
  type: string;
  message: string;
  link?: string | null;
  is_read: boolean;
  created_at?: string;
};

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  const getToken = async () => {
    const { data } = await supabase.auth.getSession();
    return data.session?.access_token || null;
  };

  const fetchNotifications = async () => {
    const token = await getToken();

    if (!token) {
      setLoading(false);
      return;
    }

    const { data: userData } = await supabase.auth.getUser();
    setUserEmail(userData.user?.email || null);

    const res = await fetch("/api/notifications", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await res.json();

    setNotifications(data.notifications || []);
    setLoading(false);
  };

  const markAllRead = async () => {
    const token = await getToken();

    if (!token) return;

    await fetch("/api/notifications", {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    await fetchNotifications();
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const unreadCount = notifications.filter((item) => !item.is_read).length;

  return (
    <main className="min-h-screen bg-gradient-to-br from-black via-zinc-950 to-orange-950 pb-24 text-white">
      <nav className="sticky top-0 z-20 flex items-center justify-between border-b border-zinc-900 bg-black/70 p-4 backdrop-blur-xl md:p-6">
        <a href="/" className="text-2xl font-black text-orange-500">
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
            href="/dashboard"
            className="rounded-full bg-orange-500 px-4 py-2 text-sm font-black text-black transition hover:bg-orange-400"
          >
            Dashboard
          </a>
        </div>
      </nav>

      <section className="mx-auto max-w-4xl px-4 py-8 md:px-6 md:py-10">
        <div className="mb-8 rounded-3xl border border-zinc-800 bg-zinc-950/80 p-6 shadow-2xl md:p-8">
          <p className="text-sm font-bold uppercase tracking-widest text-orange-400">
            Creator Alerts
          </p>

          <div className="mt-3 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <div>
              <h1 className="text-5xl font-black">Notifications 🔔</h1>

              <p className="mt-3 text-zinc-400">
                Stay updated on followers, comments, likes, and platform activity.
              </p>

              {userEmail && (
                <p className="mt-3 text-sm text-zinc-500">
                  Logged in as {userEmail}
                </p>
              )}
            </div>

            <div className="rounded-2xl border border-zinc-800 bg-black/70 px-5 py-4 text-right">
              <p className="text-3xl font-black text-orange-400">
                {unreadCount}
              </p>
              <p className="text-xs uppercase tracking-widest text-zinc-500">
                Unread
              </p>
            </div>
          </div>

          {notifications.length > 0 && (
            <button
              onClick={markAllRead}
              className="mt-6 rounded-full bg-orange-500 px-6 py-3 text-sm font-black text-black transition hover:bg-orange-400 active:scale-95"
            >
              Mark all as read
            </button>
          )}
        </div>

        {loading ? (
          <div className="rounded-3xl border border-zinc-800 bg-zinc-950/80 p-10 text-center text-orange-300">
            Loading notifications...
          </div>
        ) : !userEmail ? (
          <div className="rounded-3xl border border-zinc-800 bg-zinc-950/80 p-10 text-center">
            <h2 className="text-2xl font-black">Login required</h2>
            <p className="mt-2 text-zinc-400">
              Log in to view your notifications.
            </p>
            <a
              href="/auth"
              className="mt-6 inline-block rounded-full bg-orange-500 px-6 py-3 font-black text-black"
            >
              Login
            </a>
          </div>
        ) : notifications.length === 0 ? (
          <div className="rounded-3xl border border-zinc-800 bg-zinc-950/80 p-10 text-center">
            <h2 className="text-2xl font-black">No notifications yet</h2>
            <p className="mt-2 text-zinc-400">
              Activity on your music will appear here.
            </p>
          </div>
        ) : (
          <div className="grid gap-4">
            {notifications.map((item) => (
              <a
                key={item.id}
                href={item.link || "/dashboard"}
                className={`rounded-3xl border p-5 shadow-2xl transition hover:-translate-y-1 ${
                  item.is_read
                    ? "border-zinc-800 bg-zinc-950/70"
                    : "border-orange-500 bg-orange-950/30 shadow-orange-900/20"
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-widest text-orange-400">
                      {item.type}
                    </p>

                    <h2 className="mt-2 text-lg font-black text-white">
                      {item.message}
                    </h2>

                    {item.created_at && (
                      <p className="mt-3 text-xs text-zinc-500">
                        {new Date(item.created_at).toLocaleString()}
                      </p>
                    )}
                  </div>

                  {!item.is_read && (
                    <span className="rounded-full bg-orange-500 px-3 py-1 text-xs font-black text-black">
                      New
                    </span>
                  )}
                </div>
              </a>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}