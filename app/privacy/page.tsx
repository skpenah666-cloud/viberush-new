export default function PrivacyPage() {
    return (
      <main className="min-h-screen bg-gradient-to-br from-black via-zinc-950 to-orange-950 pb-40 text-white">
        <nav className="sticky top-0 z-20 flex items-center justify-between border-b border-zinc-900 bg-black/70 p-4 backdrop-blur-xl md:p-6">
          <a href="/" className="text-2xl font-black text-orange-500">
            VibeRush
          </a>
  
          <a
            href="/terms"
            className="rounded-full bg-orange-500 px-4 py-2 text-sm font-black text-black"
          >
            Terms
          </a>
        </nav>
  
        <section className="mx-auto max-w-4xl px-4 py-10 md:px-6">
          <div className="rounded-3xl border border-zinc-800 bg-zinc-950/80 p-6 shadow-2xl md:p-8">
            <p className="text-sm font-bold uppercase tracking-widest text-orange-400">
              Legal
            </p>
  
            <h1 className="mt-3 text-5xl font-black">Privacy Policy</h1>
  
            <p className="mt-4 text-zinc-400">
              This Privacy Policy explains how VibeRush collects, uses, and protects user information.
            </p>
  
            <div className="mt-8 space-y-6 text-zinc-300">
              <section>
                <h2 className="text-2xl font-black text-white">Information We Collect</h2>
                <p className="mt-2">
                  VibeRush may collect account information such as email address, uploaded music, profile details, likes, comments, follows, playlists, and usage activity.
                </p>
              </section>
  
              <section>
                <h2 className="text-2xl font-black text-white">How We Use Information</h2>
                <p className="mt-2">
                  We use information to provide music streaming, uploads, recommendations, notifications, analytics, account features, and platform safety.
                </p>
              </section>
  
              <section>
                <h2 className="text-2xl font-black text-white">User Content</h2>
                <p className="mt-2">
                  Music, images, comments, and profile details you upload may be visible publicly depending on how the platform displays creator content.
                </p>
              </section>
  
              <section>
                <h2 className="text-2xl font-black text-white">Third-Party Services</h2>
                <p className="mt-2">
                  VibeRush uses third-party services such as hosting, database, authentication, and storage providers to operate the platform.
                </p>
              </section>
  
              <section>
                <h2 className="text-2xl font-black text-white">Data Security</h2>
                <p className="mt-2">
                  We take reasonable steps to protect user data, but no online service can guarantee complete security.
                </p>
              </section>
  
              <section>
                <h2 className="text-2xl font-black text-white">Contact</h2>
                <p className="mt-2">
                  For privacy questions, contact the VibeRush team through the official support channel provided by the platform owner.
                </p>
              </section>
            </div>
          </div>
        </section>
      </main>
    );
  }