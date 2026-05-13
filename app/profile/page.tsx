"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function ProfilePage() {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [instagram, setInstagram] = useState("");
  const [twitter, setTwitter] = useState("");
  const [website, setWebsite] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const getToken = async () => {
    const { data } = await supabase.auth.getSession();
    return data.session?.access_token || null;
  };

  const fetchProfile = async () => {
    const token = await getToken();

    if (!token) {
      setLoading(false);
      return;
    }

    const res = await fetch("/api/profile", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await res.json();

    setEmail(data.email || "");
    setUsername(data.profile?.username || "");
    setDisplayName(data.profile?.display_name || "");
    setBio(data.profile?.bio || "");
    setAvatarUrl(data.profile?.avatar_url || "");
    setInstagram(data.profile?.instagram || "");
    setTwitter(data.profile?.twitter || "");
    setWebsite(data.profile?.website || "");
    setLoading(false);
  };

  const saveProfile = async () => {
    const token = await getToken();

    if (!token) {
      setMessage("Please log in first.");
      return;
    }

    setSaving(true);
    setMessage("Saving profile...");

    try {
      const res = await fetch("/api/profile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          username,
          displayName,
          bio,
          avatarUrl,
          instagram,
          twitter,
          website,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(data?.error || "Profile save failed.");
        return;
      }

      setMessage("Profile saved ✅");
      setUsername(data.profile?.username || username);
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  return (
    <main className="min-h-screen bg-gradient-to-br from-black via-zinc-950 to-orange-950 pb-24 text-white">
      <nav className="sticky top-0 z-20 flex items-center justify-between border-b border-zinc-900 bg-black/70 p-4 backdrop-blur-xl md:p-6">
        <a href="/" className="text-2xl font-black text-orange-500">
          VibeRush
        </a>

        <div className="flex gap-2 md:gap-3">
          <a
            href="/dashboard"
            className="rounded-full border border-zinc-700 px-4 py-2 text-sm font-bold transition hover:bg-zinc-900"
          >
            Dashboard
          </a>

          <a
            href="/library"
            className="rounded-full bg-orange-500 px-4 py-2 text-sm font-black text-black transition hover:bg-orange-400"
          >
            Library
          </a>
        </div>
      </nav>

      <section className="mx-auto max-w-4xl px-4 py-8 md:px-6 md:py-10">
        <div className="mb-8 rounded-3xl border border-zinc-800 bg-zinc-950/80 p-6 shadow-2xl md:p-8">
          <p className="text-sm font-bold uppercase tracking-widest text-orange-400">
            Creator Identity
          </p>

          <h1 className="mt-3 text-5xl font-black">Edit Profile 👤</h1>

          <p className="mt-3 text-zinc-400">
            Build your public artist identity for fans and listeners.
          </p>

          {email && (
            <p className="mt-5 rounded-xl border border-zinc-800 bg-black/60 p-3 text-sm text-zinc-400">
              Logged in as {email}
            </p>
          )}
        </div>

        {loading ? (
          <div className="rounded-3xl border border-zinc-800 bg-zinc-950/80 p-10 text-center text-orange-300">
            Loading profile...
          </div>
        ) : !email ? (
          <div className="rounded-3xl border border-zinc-800 bg-zinc-950/80 p-10 text-center">
            <h2 className="text-2xl font-black">Login required</h2>
            <p className="mt-2 text-zinc-400">
              Log in to edit your creator profile.
            </p>

            <a
              href="/auth"
              className="mt-6 inline-block rounded-full bg-orange-500 px-6 py-3 font-black text-black"
            >
              Login
            </a>
          </div>
        ) : (
          <div className="rounded-3xl border border-zinc-800 bg-zinc-950/80 p-6 shadow-2xl md:p-8">
            <div className="mb-8 flex flex-col gap-5 md:flex-row md:items-center">
              <div className="h-28 w-28 overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-900">
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt="Profile avatar"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-4xl">
                    👤
                  </div>
                )}
              </div>

              <div>
                <h2 className="text-3xl font-black">
                  {displayName || username || "Your Artist Profile"}
                </h2>

                {username && (
                  <a
                    href={`/u/${username}`}
                    className="mt-2 inline-block text-sm font-bold text-orange-400 underline"
                  >
                    View public profile
                  </a>
                )}
              </div>
            </div>

            <div className="grid gap-4">
              <input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Username, example: skpenah"
                className="rounded-xl border border-zinc-800 bg-black p-4 text-white outline-none focus:border-orange-500"
              />

              <input
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Display name"
                className="rounded-xl border border-zinc-800 bg-black p-4 text-white outline-none focus:border-orange-500"
              />

              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Bio"
                className="min-h-28 rounded-xl border border-zinc-800 bg-black p-4 text-white outline-none focus:border-orange-500"
              />

              <input
                value={avatarUrl}
                onChange={(e) => setAvatarUrl(e.target.value)}
                placeholder="Avatar image URL"
                className="rounded-xl border border-zinc-800 bg-black p-4 text-white outline-none focus:border-orange-500"
              />

              <input
                value={instagram}
                onChange={(e) => setInstagram(e.target.value)}
                placeholder="Instagram URL"
                className="rounded-xl border border-zinc-800 bg-black p-4 text-white outline-none focus:border-orange-500"
              />

              <input
                value={twitter}
                onChange={(e) => setTwitter(e.target.value)}
                placeholder="Twitter / X URL"
                className="rounded-xl border border-zinc-800 bg-black p-4 text-white outline-none focus:border-orange-500"
              />

              <input
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                placeholder="Website URL"
                className="rounded-xl border border-zinc-800 bg-black p-4 text-white outline-none focus:border-orange-500"
              />
            </div>

            <button
              onClick={saveProfile}
              disabled={saving}
              className="mt-6 w-full rounded-full bg-orange-500 px-6 py-4 font-black text-black transition hover:bg-orange-400 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? "Saving..." : "Save Profile"}
            </button>

            {message && (
              <p className="mt-5 text-center text-sm font-bold text-green-400">
                {message}
              </p>
            )}
          </div>
        )}
      </section>
    </main>
  );
}