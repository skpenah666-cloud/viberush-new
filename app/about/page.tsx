export default function AboutPage() {
    return (
      <main className="min-h-screen bg-gradient-to-br from-black via-zinc-950 to-orange-950 pb-40 text-white">
        <nav className="sticky top-0 z-20 flex items-center justify-between border-b border-zinc-900 bg-black/70 p-4 backdrop-blur-xl md:p-6">
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
              href="/auth"
              className="rounded-full bg-orange-500 px-4 py-2 text-sm font-black text-black transition hover:bg-orange-400"
            >
              Join
            </a>
          </div>
        </nav>
  
        <section className="mx-auto max-w-6xl px-4 py-10 md:px-6">
          <div className="overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-950/80 shadow-2xl">
            <div className="relative p-6 md:p-12">
              <div className="absolute right-0 top-0 h-72 w-72 rounded-full bg-orange-500/10 blur-3xl" />
              <div className="absolute bottom-0 left-0 h-72 w-72 rounded-full bg-red-500/10 blur-3xl" />
  
              <div className="relative">
                <p className="text-sm font-bold uppercase tracking-widest text-orange-400">
                  About VibeRush
                </p>
  
                <h1 className="mt-4 text-5xl font-black leading-tight md:text-7xl">
                  African sounds.
                  <br />
                  <span className="text-orange-500">Global energy.</span>
                </h1>
  
                <p className="mt-6 max-w-2xl text-lg leading-relaxed text-zinc-400">
                  VibeRush is a creator-first music platform for uploading,
                  discovering, streaming, and sharing new sounds with a modern
                  social music experience.
                </p>
  
                <div className="mt-8 flex flex-wrap gap-3">
                  <a
                    href="/auth"
                    className="rounded-full bg-orange-500 px-7 py-4 font-black text-black transition hover:bg-orange-400 active:scale-95"
                  >
                    Join VibeRush
                  </a>
  
                  <a
                    href="/discover"
                    className="rounded-full border border-zinc-700 px-7 py-4 font-black text-white transition hover:bg-zinc-900 active:scale-95"
                  >
                    Explore Music
                  </a>
                </div>
              </div>
            </div>
          </div>
  
          <div className="mt-8 grid gap-5 md:grid-cols-3">
            <div className="rounded-3xl border border-zinc-800 bg-black/70 p-6 shadow-2xl">
              <p className="text-4xl">🎧</p>
              <h2 className="mt-4 text-2xl font-black">For Listeners</h2>
              <p className="mt-3 text-zinc-400">
                Discover songs, follow artists, like tracks, build playlists,
                and enjoy music with a global player.
              </p>
            </div>
  
            <div className="rounded-3xl border border-zinc-800 bg-black/70 p-6 shadow-2xl">
              <p className="text-4xl">🎤</p>
              <h2 className="mt-4 text-2xl font-black">For Creators</h2>
              <p className="mt-3 text-zinc-400">
                Upload your music, grow followers, view analytics, receive
                notifications, and build your artist identity.
              </p>
            </div>
  
            <div className="rounded-3xl border border-zinc-800 bg-black/70 p-6 shadow-2xl">
              <p className="text-4xl">⚡</p>
              <h2 className="mt-4 text-2xl font-black">Live Platform</h2>
              <p className="mt-3 text-zinc-400">
                Realtime notifications, live comments, listener presence, trends,
                search, recommendations, and discovery feeds.
              </p>
            </div>
          </div>
  
          <div className="mt-8 rounded-3xl border border-zinc-800 bg-zinc-950/80 p-6 shadow-2xl md:p-8">
            <p className="text-sm font-bold uppercase tracking-widest text-orange-400">
              Platform Features
            </p>
  
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              {[
                "Music uploads and public song pages",
                "Global persistent audio player",
                "Likes, comments, follows, and notifications",
                "Artist profiles and creator dashboards",
                "Playlists, history, trending, and discovery",
                "Realtime comments, alerts, and listener presence",
                "Installable PWA experience",
                "Mobile-first navigation and responsive design",
              ].map((feature) => (
                <div
                  key={feature}
                  className="rounded-2xl border border-zinc-800 bg-black/60 p-4"
                >
                  <p className="font-bold text-zinc-200">✅ {feature}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
    );
  }