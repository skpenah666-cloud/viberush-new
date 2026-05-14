"use client";

import { usePathname } from "next/navigation";

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
    href: "/activity",
    label: "Activity",
    icon: "⚡",
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
                className={`flex min-w-0 flex-1 flex-col items-center justify-center rounded-2xl px-2 py-3 text-center transition active:scale-95 ${
                  active
                    ? "bg-orange-500 text-black"
                    : "text-zinc-500 hover:bg-zinc-900 hover:text-white"
                }`}
              >
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