export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-black via-zinc-950 to-orange-950 text-white">
      <nav className="flex items-center justify-between p-6">
        <h1 className="text-2xl font-bold text-orange-500">VibeRush</h1>

        <div className="flex gap-3">
          <a
            href="/upload"
            className="rounded-full bg-white px-5 py-2 text-sm font-bold text-black transition active:scale-95"
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

      <section className="mx-auto flex min-h-[80vh] max-w-4xl flex-col items-center justify-center px-6 text-center">
        <p className="mb-4 rounded-full border border-orange-500/40 bg-orange-500/10 px-4 py-2 text-sm text-orange-300">
          African sounds. Global energy.
        </p>

        <h2 className="text-6xl font-black tracking-tight md:text-7xl">
          Upload your sound.
          <br />
          <span className="text-orange-500">Build your wave.</span>
        </h2>

        <p className="mt-6 max-w-xl text-lg text-zinc-400">
          VibeRush helps creators upload, play, manage, and share music with a clean premium experience.
        </p>

        <div className="mt-10 flex flex-col gap-4 sm:flex-row">
          <a
            href="/upload"
            className="rounded-full bg-orange-500 px-8 py-4 font-bold text-black transition hover:bg-orange-400 active:scale-95"
          >
            Start Uploading
          </a>

          <a
            href="/library"
            className="rounded-full border border-zinc-700 px-8 py-4 font-bold text-white transition hover:bg-zinc-900 active:scale-95"
          >
            View Library
          </a>
        </div>
      </section>
    </main>
  );
}