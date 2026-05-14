"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function AuthPage() {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [checkingUser, setCheckingUser] = useState(true);

  useEffect(() => {
    const checkUser = async () => {
      const { data } = await supabase.auth.getUser();
      setUserEmail(data.user?.email || null);
      setCheckingUser(false);
    };

    checkUser();
  }, []);

  const handleAuth = async () => {
    if (!email.trim() || !password.trim()) {
      setMessage("Enter your email and password.");
      return;
    }

    if (password.length < 6) {
      setMessage("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);
    setMessage("Please wait...");

    const result =
      mode === "login"
        ? await supabase.auth.signInWithPassword({
            email: email.trim(),
            password,
          })
        : await supabase.auth.signUp({
            email: email.trim(),
            password,
          });

    if (result.error) {
      setMessage(result.error.message);
      setLoading(false);
      return;
    }

    const { data } = await supabase.auth.getUser();
    setUserEmail(data.user?.email || email.trim());

    setMessage(
      mode === "login"
        ? "Logged in successfully ✅ Redirecting..."
        : "Account created ✅ Check your email if confirmation is required."
    );

    setLoading(false);

    if (mode === "login") {
      setTimeout(() => {
        window.location.href = "/library";
      }, 800);
    }
  };

  const logout = async () => {
    setLoading(true);
    await supabase.auth.signOut();
    setUserEmail(null);
    setMessage("Logged out successfully.");
    setLoading(false);
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-black via-zinc-950 to-orange-950 text-white">
      <nav className="sticky top-0 z-20 flex items-center justify-between border-b border-zinc-900 bg-black/60 p-4 backdrop-blur-xl md:p-6">
        <a href="/" className="text-2xl font-black text-orange-500">
          VibeRush
        </a>

        <div className="flex gap-2 md:gap-3">
          <a
            href="/discover"
            className="rounded-full border border-zinc-700 px-4 py-2 text-sm font-bold transition hover:bg-zinc-900"
          >
            Discover
          </a>

          <a
            href="/library"
            className="rounded-full bg-orange-500 px-4 py-2 text-sm font-black text-black transition hover:bg-orange-400"
          >
            Library
          </a>
        </div>
      </nav>

      <section className="mx-auto grid min-h-[85vh] max-w-6xl items-center gap-8 px-4 py-10 md:grid-cols-[1fr_420px] md:px-6">
        <div className="relative hidden md:block">
          <div className="absolute -left-10 top-0 h-72 w-72 rounded-full bg-orange-500/10 blur-3xl" />
          <div className="absolute bottom-0 right-20 h-72 w-72 rounded-full bg-red-500/10 blur-3xl" />

          <p className="relative rounded-full border border-orange-500/40 bg-orange-500/10 px-5 py-2 text-sm font-bold uppercase tracking-widest text-orange-300 backdrop-blur-xl">
            Creator access
          </p>

          <h1 className="relative mt-6 text-6xl font-black leading-tight">
            Build your sound.
            <br />
            <span className="text-orange-500">Own your wave.</span>
          </h1>

          <p className="relative mt-6 max-w-xl text-lg leading-relaxed text-zinc-400">
            Log in to upload tracks, manage your catalog, follow artists,
            save favorites, comment, and track your creator growth.
          </p>

          <div className="relative mt-8 grid max-w-xl gap-4 md:grid-cols-2">
            <div className="rounded-3xl border border-zinc-800 bg-zinc-950/70 p-5">
              <p className="text-3xl">🎧</p>
              <h3 className="mt-3 font-black">Stream</h3>
              <p className="mt-2 text-sm text-zinc-500">
                Play songs with the global VibeRush player.
              </p>
            </div>

            <div className="rounded-3xl border border-zinc-800 bg-zinc-950/70 p-5">
              <p className="text-3xl">📊</p>
              <h3 className="mt-3 font-black">Grow</h3>
              <p className="mt-2 text-sm text-zinc-500">
                Track plays, likes, followers, and comments.
              </p>
            </div>
          </div>
        </div>

        <div className="w-full rounded-3xl border border-zinc-800 bg-zinc-950/85 p-6 shadow-2xl backdrop-blur-xl md:p-8">
          <p className="text-sm font-bold uppercase tracking-widest text-orange-400">
            Account Access
          </p>

          <h1 className="mt-3 text-4xl font-black">
            {userEmail
              ? "You are signed in"
              : mode === "login"
                ? "Welcome back"
                : "Create account"}
          </h1>

          {checkingUser ? (
            <p className="mt-6 rounded-2xl border border-zinc-800 bg-black/60 p-4 text-sm font-bold text-orange-300">
              Checking session...
            </p>
          ) : userEmail ? (
            <div className="mt-8">
              <div className="rounded-2xl border border-green-900 bg-green-950/30 p-4">
                <p className="text-sm font-bold text-green-300">
                  Logged in as
                </p>

                <p className="mt-1 break-all text-zinc-200">{userEmail}</p>
              </div>

              <div className="mt-5 grid gap-3">
                <a
                  href="/upload"
                  className="rounded-full bg-orange-500 px-6 py-4 text-center font-black text-black transition hover:bg-orange-400 active:scale-95"
                >
                  Upload Music
                </a>

                <a
                  href="/dashboard"
                  className="rounded-full border border-zinc-700 px-6 py-4 text-center font-black text-white transition hover:bg-zinc-900 active:scale-95"
                >
                  Creator Dashboard
                </a>

                <a
                  href="/profile"
                  className="rounded-full border border-zinc-700 px-6 py-4 text-center font-black text-white transition hover:bg-zinc-900 active:scale-95"
                >
                  Edit Profile
                </a>

                <button
                  onClick={logout}
                  disabled={loading}
                  className="rounded-full bg-red-600 px-6 py-4 font-black text-white transition hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? "Please wait..." : "Logout"}
                </button>
              </div>
            </div>
          ) : (
            <>
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                type="email"
                className="mt-8 w-full rounded-xl border border-zinc-800 bg-black p-4 text-white outline-none transition placeholder:text-zinc-600 focus:border-orange-500"
              />

              <input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                type="password"
                className="mt-4 w-full rounded-xl border border-zinc-800 bg-black p-4 text-white outline-none transition placeholder:text-zinc-600 focus:border-orange-500"
              />

              <button
                onClick={handleAuth}
                disabled={loading}
                className="mt-6 w-full rounded-full bg-orange-500 px-6 py-4 font-black text-black transition hover:bg-orange-400 active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading
                  ? "Please wait..."
                  : mode === "login"
                    ? "Log In"
                    : "Sign Up"}
              </button>

              <button
                onClick={() => {
                  setMode(mode === "login" ? "signup" : "login");
                  setMessage("");
                }}
                className="mt-5 w-full text-sm font-bold text-orange-300"
              >
                {mode === "login"
                  ? "Need an account? Sign up"
                  : "Already have an account? Log in"}
              </button>
            </>
          )}

          {message && (
            <p className="mt-5 rounded-xl border border-zinc-800 bg-black/60 p-3 text-center text-sm font-semibold text-green-400">
              {message}
            </p>
          )}
        </div>
      </section>
    </main>
  );
}