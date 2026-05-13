export default function Home() {
  return (
    <main className="min-h-screen overflow-hidden bg-gradient-to-br from-black via-zinc-950 to-orange-950 text-white">
      <nav className="sticky top-0 z-20 flex items-center justify-between border-b border-zinc-900 bg-black/40 p-4 backdrop-blur-xl md:p-6">
        <h1 className="text-2xl font-black text-orange-500">
          VibeRush
        </h1>

        <div className="flex flex-wrap gap-2 md:gap-3">
          <a
            href="/trending"
            className="rounded-full border border-orange-500/40 bg-orange-500/10 px-4 py-2 text-sm font-bold text-orange-300 transition hover:bg-orange-500/20 active:scale-95"
          >
            Trending
          </a>

          <a
            href="/upload"
            className="rounded-full bg-white px-5 py-2 text-sm font-bold text-black transition hover:bg-zinc-200 active:scale-95"
          >
            Upload
          </a>

          <a
            href="/library"
            className="rounded-full border border-zinc-700 px-5 py-2 text-sm font-bold text-white transition hover:bg-zinc-900 active:scale-95"
          >
            Library
          </a>
        </div>
      </nav>

      <section className="relative mx-auto flex min-h-[88vh] max-w-6xl flex-col items-center justify-center px-6 text-center">
        <div className="absolute left-0 top-20 h-72 w-72 rounded-full bg-orange-500/10 blur-3xl" />
        <div className="absolute bottom-10 right-0 h-80 w-80 rounded-full bg-red-500/10 blur-3xl" />

        <p className="relative mb-5 rounded-full border border-orange-500/40 bg-orange-500/10 px-5 py-2 text-sm font-semibold text-orange-300 backdrop-blur-xl">
          African sounds. Global energy.
        </p>

        <h2 className="relative text-5xl font-black tracking-tight md:text-7xl">
          Upload your sound.
          <br />
          <span className="text-orange-500">
            Build your wave.
          </span>
        </h2>

        <p className="relative mt-6 max-w-2xl text-lg leading-relaxed text-zinc-400 md:text-xl">
          VibeRush helps creators upload, stream, manage,
          trend, and share music with a premium modern experience.
        </p>

        <div className="relative mt-10 flex flex-col gap-4 sm:flex-row">
          <a
            href="/upload"
            className="rounded-full bg-orange-500 px-8 py-4 font-black text-black transition hover:bg-orange-400 active:scale-95"
          >
            Start Uploading
          </a>

          <a
            href="/library"
            className="rounded-full border border-zinc-700 px-8 py-4 font-black text-white transition hover:bg-zinc-900 active:scale-95"
          >
            View Library
          </a>

          <a
            href="/trending"
            className="rounded-full border border-orange-500 bg-orange-500/10 px-8 py-4 font-black text-orange-300 transition hover:bg-orange-500/20 active:scale-95"
          >
            Explore Trending
          </a>
        </div>

        <div className="relative mt-20 grid w-full gap-4 md:grid-cols-4">
          <div className="rounded-3xl border border-zinc-800 bg-zinc-950/70 p-6 backdrop-blur-xl">
            <p className="text-4xl">🎧</p>

            <h3 className="mt-4 text-lg font-black">
              Smart Library
            </h3>

            <p className="mt-2 text-sm text-zinc-400">
              Organize and stream your uploaded tracks beautifully.
            </p>
          </div>

          <div className="rounded-3xl border border-zinc-800 bg-zinc-950/70 p-6 backdrop-blur-xl">
            <p className="text-4xl">❤️</p>

            <h3 className="mt-4 text-lg font-black">
              Favorites
            </h3>

            <p className="mt-2 text-sm text-zinc-400">
              Save songs you love and revisit them anytime.
            </p>
          </div>

          <div className="rounded-3xl border border-zinc-800 bg-zinc-950/70 p-6 backdrop-blur-xl">
            <p className="text-4xl">📈</p>

            <h3 className="mt-4 text-lg font-black">
              Trending Charts
            </h3>

            <p className="mt-2 text-sm text-zinc-400">
              Discover the hottest music across the platform.
            </p>
          </div>

          <div className="rounded-3xl border border-zinc-800 bg-zinc-950/70 p-6 backdrop-blur-xl">
            <p className="text-4xl">🎵</p>

            <h3 className="mt-4 text-lg font-black">
              Visual Playback
            </h3>

            <p className="mt-2 text-sm text-zinc-400">
              Enjoy animated waveforms and immersive music visuals.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}