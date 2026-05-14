"use client";

import { useEffect, useMemo, useState } from "react";
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

const notificationStyles: Record<
  string,
  {
    icon: string;
    badge: string;
    border: string;
    background: string;
  }
> = {
  like: {
    icon: "❤️",
    badge: "Like",
    border: "border-pink-500/40",
    background: "bg-pink-950/20",
  },
  comment: {
    icon: "💬",
    badge: "Comment",
    border: "border-blue-500/40",
    background: "bg-blue-950/20",
  },
  follow: {
    icon: "👤",
    badge: "Follow",
    border: "border-green-500/40",
    background: "bg-green-950/20",
  },
  upload: {
    icon: "🎵",
    badge: "Upload",
    border: "border-orange-500/40",
    background: "bg-orange-950/20",
  },
};

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [markingRead, setMarkingRead] = useState(false);

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

    setMarkingRead(true);

    await fetch("/api/notifications", {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    await fetchNotifications();

    setMarkingRead(false);
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const unreadCount = notifications.filter(
    (item) => !item.is_read
  ).length;

  const groupedNotifications = useMemo(() => {
    const today: Notification[] = [];
    const earlier: Notification[] = [];

    notifications.forEach((notification) => {
      if (!notification.created_at) {
        earlier.push(notification);
        return;
      }

      const created = new Date(notification.created_at);
      const now = new Date();

      const sameDay =
        created.getDate() === now.getDate() &&
        created.getMonth() === now.getMonth() &&
        created.getFullYear() === now.getFullYear();

      if (sameDay) {
        today.push(notification);
      } else {
        earlier.push(notification);
      }
    });

    return {
      today,
      earlier,
    };
  }, [notifications]);

  const renderNotificationCard = (item: Notification) => {
    const style =
      notificationStyles[item.type.toLowerCase()] ||
      notificationStyles.upload;

    return (
      <a
        key={item.id}
        href={item.link || "/dashboard"}
        className={`group rounded-3xl border p-5 shadow-2xl transition hover:-translate-y-1 ${
          item.is_read
            ? "border-zinc-800 bg-zinc-950/70"
            : `${style.border} ${style.background} shadow-orange-900/20`
        }`}
      >
        <div className="flex items-start gap-4">
          <div
            className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border text-2xl ${
              item.is_read
                ? "border-zinc-800 bg-black/60"
                : `${style.border} ${style.background}`
            }`}
          >
            {style.icon}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={`rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-widest ${
                  item.is_read
                    ? "bg-zinc-800 text-zinc-400"
                    : "bg-orange-500 text-black"
                }`}
              >
                {style.badge}
              </span>

              {!item.is_read && (
                <span className="rounded-full bg-white px-3 py-1 text-[10px] font-black uppercase tracking-widest text-black">
                  New
                </span>
              )}
            </div>

            <h2 className="mt-3 text-lg font-black leading-snug text-white">
              {item.message}
            </h2>

            {item.created_at && (
              <p className="mt-3 text-xs text-zinc-500">
                {new Date(item.created_at).toLocaleString()}
              </p>
            )}
          </div>

          <div className="hidden rounded-full bg-zinc-800 px-4 py-2 text-xs font-black text-white transition group-hover:bg-orange-500 group-hover:text-black md:block">
            Open →
          </div>
        </div>
      </a>
    );
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-black via-zinc-950 to-orange-950 pb-40 text-white">
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

      <section className="mx-auto max-w-5xl px-4 py-8 md:px-6 md:py-10">
        <div className="mb-8 overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-950/80 shadow-2xl">
          <div className="relative p-6 md:p-8">
            <div className="absolute right-0 top-0 h-48 w-48 rounded-full bg-orange-500/10 blur-3xl" />

            <div className="relative">
              <p className="text-sm font-bold uppercase tracking-widest text-orange-400">
                Social Inbox
              </p>

              <div className="mt-3 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
                <div>
                  <h1 className="text-5xl font-black">
                    Notifications 🔔
                  </h1>

                  <p className="mt-3 max-w-2xl text-zinc-400">
                    Track audience engagement, comments, likes,
                    follows, and creator activity in real time.
                  </p>

                  {userEmail && (
                    <p className="mt-4 text-sm text-zinc-500">
                      Logged in as {userEmail}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-2xl border border-zinc-800 bg-black/70 px-5 py-4 text-right">
                    <p className="text-3xl font-black text-orange-400">
                      {notifications.length}
                    </p>

                    <p className="text-xs uppercase tracking-widest text-zinc-500">
                      Total
                    </p>
                  </div>

                  <div className="rounded-2xl border border-orange-500/40 bg-orange-950/20 px-5 py-4 text-right">
                    <p className="text-3xl font-black text-orange-400">
                      {unreadCount}
                    </p>

                    <p className="text-xs uppercase tracking-widest text-zinc-500">
                      Unread
                    </p>
                  </div>
                </div>
              </div>

              {notifications.length > 0 && (
                <button
                  onClick={markAllRead}
                  disabled={markingRead}
                  className="mt-6 rounded-full bg-orange-500 px-6 py-3 text-sm font-black text-black transition hover:bg-orange-400 active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {markingRead
                    ? "Updating..."
                    : "Mark all as read"}
                </button>
              )}
            </div>
          </div>
        </div>

        {loading ? (
          <div className="rounded-3xl border border-zinc-800 bg-zinc-950/80 p-10 text-center text-orange-300">
            Loading notifications...
          </div>
        ) : !userEmail ? (
          <div className="rounded-3xl border border-zinc-800 bg-zinc-950/80 p-10 text-center">
            <h2 className="text-2xl font-black">
              Login required
            </h2>

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
            <h2 className="text-2xl font-black">
              No notifications yet
            </h2>

            <p className="mt-2 text-zinc-400">
              Audience activity will appear here.
            </p>
          </div>
        ) : (
          <div className="space-y-10">
            {groupedNotifications.today.length > 0 && (
              <div>
                <div className="mb-4 flex items-center gap-3">
                  <div className="h-px flex-1 bg-zinc-800" />

                  <p className="text-xs font-black uppercase tracking-[0.3em] text-orange-400">
                    Today
                  </p>

                  <div className="h-px flex-1 bg-zinc-800" />
                </div>

                <div className="grid gap-4">
                  {groupedNotifications.today.map(
                    renderNotificationCard
                  )}
                </div>
              </div>
            )}

            {groupedNotifications.earlier.length > 0 && (
              <div>
                <div className="mb-4 flex items-center gap-3">
                  <div className="h-px flex-1 bg-zinc-800" />

                  <p className="text-xs font-black uppercase tracking-[0.3em] text-zinc-500">
                    Earlier
                  </p>

                  <div className="h-px flex-1 bg-zinc-800" />
                </div>

                <div className="grid gap-4">
                  {groupedNotifications.earlier.map(
                    renderNotificationCard
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </section>
    </main>
  );
}