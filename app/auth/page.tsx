"use client";

import { useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

export default function AuthPage() {
  const supabase = createClientComponentClient();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleAuth = async () => {
    setMessage("Please wait...");

    const result =
      mode === "login"
        ? await supabase.auth.signInWithPassword({ email, password })
        : await supabase.auth.signUp({ email, password });

    if (result.error) {
      setMessage(result.error.message);
      return;
    }

    setMessage(
      mode === "login"
        ? "Logged in successfully ✅"
        : "Account created ✅ Check your email if confirmation is required."
    );
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-black via-zinc-950 to-orange-950 text-white">
      <nav className="flex items-center justify-between border-b border-zinc-900 bg-black/60 p-6 backdrop-blur-xl">
        <a href="/" className="text-2xl font-black text-orange-500">
          VibeRush
        </a>

        <a href="/library" className="rounded-full border border-zinc-700 px-5 py-2 text-sm font-bold">
          Library
        </a>
      </nav>

      <section className="mx-auto flex min-h-[80vh] max-w-md items-center px-6">
        <div className="w-full rounded-3xl border border-zinc-800 bg-zinc-950/80 p-8 shadow-2xl">
          <p className="text-sm font-bold uppercase tracking-widest text-orange-400">
            Account Access
          </p>

          <h1 className="mt-3 text-4xl font-black">
            {mode === "login" ? "Welcome back" : "Create account"}
          </h1>

          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            type="email"
            className="mt-8 w-full rounded-xl border border-zinc-800 bg-black p-4 text-white outline-none focus:border-orange-500"
          />

          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            type="password"
            className="mt-4 w-full rounded-xl border border-zinc-800 bg-black p-4 text-white outline-none focus:border-orange-500"
          />

          <button
            onClick={handleAuth}
            className="mt-6 w-full rounded-full bg-orange-500 px-6 py-4 font-black text-black transition hover:bg-orange-400 active:scale-95"
          >
            {mode === "login" ? "Log In" : "Sign Up"}
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

          {message && (
            <p className="mt-5 text-center text-sm font-semibold text-green-400">
              {message}
            </p>
          )}
        </div>
      </section>
    </main>
  );
}