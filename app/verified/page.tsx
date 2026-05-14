"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function VerifiedPage() {
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      const { data } = await supabase.auth.getUser();
      setUserEmail(data.user?.email || null);
    };

    fetchUser();
  }, []);

  return (
    <main className="min-h-screen bg-gradient-to-br from-black via-zinc-950 to-orange-950 pb-40 text-white">
      <nav className="sticky top-0 z-20 flex items-center justify-between border-b border-zinc-900 bg-black/70 p-4 backdrop-blur-xl md:p-6">
        <a href="/" className="text-2xl font-black text-orange-500">
          VibeRush
        </a>

        <div className="flex gap-2 md:gap-3">
          <a
            href="/profile"
            className="rounded-full border border-zinc-700 px-4 py-2 text-sm font-bold transition hover:bg-zinc-900"
          >
            Profile
          </a>

          <a
            href="/dashboard"
            className="rounded-full bg-orange-500 px-4 py-2 text-sm font-black text-black transition hover:bg-orange-400"
          >
            Dashboard
          </a>
        </div>
      </nav>

      <section className="mx-auto max-w-6xl px-4 py-8 md:px-6 md:py-10">
        <div className="overflow-hidden rounded-3xl border border-orange-500/30 bg-zinc-950/80 shadow-2xl">
          <div className="relative p-6 md:p-10">
            <div className="absolute right-0 top-0 h-72 w-72 rounded-full bg-orange-500/10 blur-3xl" />
            <div className="absolute bottom-0 left-0 h-72 w-72 rounded-full bg-red-500/10 blur-3xl" />

            <div className="relative">
              <p className="text-sm font-bold uppercase tracking-widest text-orange-400">
                Creator Status
              </p>

              <h1 className="mt-4 text-5xl font-black md:text-7xl">
                Get Verified ✅
              </h1>

              <p className="mt-5 max-w-2xl text-lg leading-relaxed text-zinc-400">
                Verification helps listeners trust your artist identity and makes
                your profile feel official across VibeRush.
              </p>

              {userEmail ? (
                <p className="mt-6 rounded-2xl border border-zinc-800 bg-black/60 p-4 text-sm text-zinc-400">
                  Signed in as {userEmail}
                </p>
              ) : (
                <a
                  href="/auth"
                  className="mt-6 inline-block rounded-full bg-orange-500 px-6 py-3 font-black text-black transition hover:bg-orange-400"
                >
                  Login to Apply
                </a>
              )}
            </div>
          </div>
        </div>

        <div className="mt-8 grid gap-5 md:grid-cols-3">
          <div className="rounded-3xl border border-zinc-800 bg-black/70 p-6 shadow-2xl">
            <p className="text-4xl">✅</p>
            <h2 className="mt-4 text-2xl font-black">Verified Badge</h2>
            <p className="mt-3 text-zinc-400">
              Show fans that your artist profile is official and trusted.
            </p>
          </div>

          <div className="rounded-3xl border border-zinc-800 bg-black/70 p-6 shadow-2xl">
            <p className="text-4xl">📈</p>
            <h2 className="mt-4 text-2xl font-black">More Credibility</h2>
            <p className="mt-3 text-zinc-400">
              Stand out in search, artist pages, discovery, and future charts.
            </p>
          </div>

          <div className="rounded-3xl border border-zinc-800 bg-black/70 p-6 shadow-2xl">
            <p className="text-4xl">🎤</p>
            <h2 className="mt-4 text-2xl font-black">Creator Identity</h2>
            <p className="mt-3 text-zinc-400">
              Build a premium music brand with a professional public profile.
            </p>
          </div>
        </div>

        <div className="mt-8 rounded-3xl border border-zinc-800 bg-zinc-950/80 p-6 shadow-2xl md:p-8">
          <p className="text-sm font-bold uppercase tracking-widest text-orange-400">
            Verification Checklist
          </p>

          <div className="mt-6 grid gap-4">
            {[
              "Upload at least one original song",
              "Complete your creator profile",
              "Add profile image or avatar URL",
              "Use a recognizable artist name",
              "Connect social links if available",
            ].map((item) => (
              <div
                key={item}
                className="flex items-center gap-4 rounded-2xl border border-zinc-800 bg-black/60 p-4"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-orange-500 text-sm font-black text-black">
                  ✓
                </span>

                <p className="font-bold text-zinc-200">{item}</p>
              </div>
            ))}
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <a
              href="/profile"
              className="rounded-full bg-orange-500 px-6 py-3 font-black text-black transition hover:bg-orange-400"
            >
              Complete Profile
            </a>

            <a
              href="/upload"
              className="rounded-full border border-zinc-700 px-6 py-3 font-black text-white transition hover:bg-zinc-900"
            >
              Upload Music
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}