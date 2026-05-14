"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type Profile = {
  username?: string | null;
  bio?: string | null;
  favorite_genre?: string | null;
  instagram?: string | null;
  twitter?: string | null;
  avatar_url?: string | null;
};

export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile>({
    username: "",
    bio: "",
    favorite_genre: "",
    instagram: "",
    twitter: "",
    avatar_url: "",
  });

  const [email, setEmail] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      const { data } = await supabase.auth.getUser();

      if (!data.user) return;

      setEmail(data.user.email || null);
      setUserId(data.user.id);

      const { data: existingProfile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", data.user.id)
        .maybeSingle();

      if (existingProfile) {
        setProfile(existingProfile);
      }
    };

    fetchProfile();
  }, []);

  const saveProfile = async () => {
    if (!userId) {
      setMessage("Please log in first.");
      return;
    }

    setSaving(true);
    setMessage("");

    const { error } = await supabase.from("profiles").upsert({
      id: userId,
      username: profile.username,
      bio: profile.bio,
      favorite_genre: profile.favorite_genre,
      instagram: profile.instagram,
      twitter: profile.twitter,
      avatar_url: profile.avatar_url,
      updated_at: new Date().toISOString(),
    });

    if (error) {
      setMessage(error.message);
      setSaving(false);
      return;
    }

    setMessage("Profile updated successfully ✅");
    setSaving(false);
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

      <section className="mx-auto max-w-4xl px-4 py-8 md:px-6 md:py-10">
        <div className="rounded-3xl border border-zinc-800 bg-zinc-950/80 p-6 shadow-2xl md:p-8">
          <p className="text-sm font-bold uppercase tracking-widest text-orange-400">
            Creator Identity
          </p>

          <h1 className="mt-3 text-5xl font-black">Profile 👤</h1>

          <p className="mt-3 max-w-xl text-zinc-400">
            Customize your public creator identity on VibeRush.
          </p>

          {email && (
            <div className="mt-6 rounded-2xl border border-zinc-800 bg-black/60 p-4">
              <p className="text-xs font-bold uppercase tracking-widest text-zinc-500">
                Logged In As
              </p>

              <p className="mt-2 text-sm text-zinc-300">{email}</p>
            </div>
          )}

          <div className="mt-8 grid gap-6">
            <div>
              <label className="mb-2 block text-sm font-bold text-orange-300">
                Avatar URL
              </label>

              <input
                value={profile.avatar_url || ""}
                onChange={(e) =>
                  setProfile({
                    ...profile,
                    avatar_url: e.target.value,
                  })
                }
                placeholder="https://..."
                className="w-full rounded-2xl border border-zinc-800 bg-black p-4 text-white outline-none transition placeholder:text-zinc-600 focus:border-orange-500"
              />

              {profile.avatar_url && (
                <div className="mt-4">
                  <img
                    src={profile.avatar_url}
                    alt="Profile avatar"
                    className="h-28 w-28 rounded-3xl object-cover ring-2 ring-orange-500"
                  />
                </div>
              )}
            </div>

            <div>
              <label className="mb-2 block text-sm font-bold text-orange-300">
                Username
              </label>

              <input
                value={profile.username || ""}
                onChange={(e) =>
                  setProfile({
                    ...profile,
                    username: e.target.value,
                  })
                }
                placeholder="Your artist name..."
                className="w-full rounded-2xl border border-zinc-800 bg-black p-4 text-white outline-none transition placeholder:text-zinc-600 focus:border-orange-500"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-bold text-orange-300">
                Bio
              </label>

              <textarea
                value={profile.bio || ""}
                onChange={(e) =>
                  setProfile({
                    ...profile,
                    bio: e.target.value,
                  })
                }
                placeholder="Tell listeners about yourself..."
                className="min-h-32 w-full rounded-2xl border border-zinc-800 bg-black p-4 text-white outline-none transition placeholder:text-zinc-600 focus:border-orange-500"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-bold text-orange-300">
                Favorite Genre
              </label>

              <input
                value={profile.favorite_genre || ""}
                onChange={(e) =>
                  setProfile({
                    ...profile,
                    favorite_genre: e.target.value,
                  })
                }
                placeholder="Afrobeats, Amapiano..."
                className="w-full rounded-2xl border border-zinc-800 bg-black p-4 text-white outline-none transition placeholder:text-zinc-600 focus:border-orange-500"
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-bold text-orange-300">
                  Instagram
                </label>

                <input
                  value={profile.instagram || ""}
                  onChange={(e) =>
                    setProfile({
                      ...profile,
                      instagram: e.target.value,
                    })
                  }
                  placeholder="@username"
                  className="w-full rounded-2xl border border-zinc-800 bg-black p-4 text-white outline-none transition placeholder:text-zinc-600 focus:border-orange-500"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold text-orange-300">
                  Twitter / X
                </label>

                <input
                  value={profile.twitter || ""}
                  onChange={(e) =>
                    setProfile({
                      ...profile,
                      twitter: e.target.value,
                    })
                  }
                  placeholder="@username"
                  className="w-full rounded-2xl border border-zinc-800 bg-black p-4 text-white outline-none transition placeholder:text-zinc-600 focus:border-orange-500"
                />
              </div>
            </div>

            <button
              onClick={saveProfile}
              disabled={saving}
              className="rounded-full bg-orange-500 px-6 py-4 font-black text-black transition hover:bg-orange-400 active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? "Saving..." : "Save Profile"}
            </button>

            {message && (
              <div className="rounded-2xl border border-zinc-800 bg-black/60 p-4 text-sm font-bold text-green-400">
                {message}
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}