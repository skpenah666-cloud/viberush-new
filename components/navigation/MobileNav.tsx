"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const navItems = [
  {
    href: "/",
    label: "Home",
    icon: "🏠",
  },
  {
    href: "/discover",
    label: "Discover",
    icon: "🎶",
  },
  {
    href: "/notifications",
    label: "Alerts",
    icon: "🔔",
    hasBadge: true,
  },
  {
    href: "/library",
    label: "Library",
    icon: "🎧",
  },
  {
    href: "/profile",
    label: "Profile",
    icon: "👤",
  },
];

export default function MobileNav() {
  const pathname = usePathname();
  const [unreadCount, setUnreadCount] = useState(0);

  const getToken = async () => {
    const { data } = await supabase.auth.getSession();
    return data.session?.access_token || null;
  };

  const fetchUnreadCount = async () => {
    const token = await getToken();

    if (!token) {
      setUnreadCount(0);
      return;
    }

    try {
      const res = await fetch("/api/notifications", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      const unread = (data.notifications || []).filter(
        (item: { is_read: boolean }) => !item.is_read
      ).length;

      setUnreadCount(unread);
    } catch {
      setUnreadCount(0);
    }
  };

  useEffect(() => {
    fetchUnreadCount();
  }, [pathname]);

  return (
    <>
      <a
        href="/upload"
        className="fixed bottom-24 right-5 z-50 flex h-16 w-16 items-center justify-center rounded-full bg-orange-500 text-3xl font-black text-black shadow-2xl shadow-orange-900/40 transition hover:scale-105 hover:bg-orange-400 active:scale-95 md:bottom-6"
      >
        +
      </a>

      <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-zinc-800 bg-black/95 px-2 pb-safe backdrop-blur-xl">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-1 py-2">
          {navItems.map((item) => {
            const active =
              pathname === item.href ||
              (item.href !== "/" && pathname.startsWith(item.href));

            return (
              <a
                key={item.href}
                href={item.href}
                className={`relative flex min-w-0 flex-1 flex-col items-center justify-center rounded-2xl px-2 py-3 text-center transition active:scale-95 ${
                  active
                    ? "bg-orange-500 text-black"
                    : "text-zinc-500 hover:bg-zinc-900 hover:text-white"
                }`}
              >
                {item.hasBadge && unreadCount > 0 && (
                  <span className="absolute right-3 top-2 flex min-h-5 min-w-5 items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-black text-white ring-2 ring-black">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}

                <span className="text-xl">{item.icon}</span>

                <span className="mt-1 truncate text-[11px] font-black uppercase tracking-wide">
                  {item.label}
                </span>
              </a>
            );
          })}
        </div>
      </nav>
    </>
  );
}