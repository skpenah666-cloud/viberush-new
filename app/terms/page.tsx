export default function TermsPage() {
    return (
      <main className="min-h-screen bg-gradient-to-br from-black via-zinc-950 to-orange-950 pb-40 text-white">
        <nav className="sticky top-0 z-20 flex items-center justify-between border-b border-zinc-900 bg-black/70 p-4 backdrop-blur-xl md:p-6">
          <a href="/" className="text-2xl font-black text-orange-500">
            VibeRush
          </a>
  
          <a
            href="/privacy"
            className="rounded-full bg-orange-500 px-4 py-2 text-sm font-black text-black"
          >
            Privacy
          </a>
        </nav>
  
        <section className="mx-auto max-w-4xl px-4 py-10 md:px-6">
          <div className="rounded-3xl border border-zinc-800 bg-zinc-950/80 p-6 shadow-2xl md:p-8">
            <p className="text-sm font-bold uppercase tracking-widest text-orange-400">
              Legal
            </p>
  
            <h1 className="mt-3 text-5xl font-black">Terms of Service</h1>
  
            <p className="mt-4 text-zinc-400">
              By using VibeRush, you agree to these Terms of Service.
            </p>
  
            <div className="mt-8 space-y-6 text-zinc-300">
              <section>
                <h2 className="text-2xl font-black text-white">Use of VibeRush</h2>
                <p className="mt-2">
                  Users may upload, stream, discover, like, comment, follow, and share music through VibeRush in accordance with these terms.
                </p>
              </section>
  
              <section>
                <h2 className="text-2xl font-black text-white">User Content</h2>
                <p className="mt-2">
                  You are responsible for music, images, comments, profile information, and other content you upload or share on VibeRush.
                </p>
              </section>
  
              <section>
                <h2 className="text-2xl font-black text-white">Copyright</h2>
                <p className="mt-2">
                  Do not upload music or content you do not own or have permission to use. VibeRush may remove content that violates copyright or platform rules.
                </p>
              </section>
  
              <section>
                <h2 className="text-2xl font-black text-white">Account Responsibility</h2>
                <p className="mt-2">
                  You are responsible for maintaining access to your account and for activity that occurs under your account.
                </p>
              </section>
  
              <section>
                <h2 className="text-2xl font-black text-white">Platform Availability</h2>
                <p className="mt-2">
                  VibeRush may change, pause, or remove features as the platform grows and improves.
                </p>
              </section>
  
              <section>
                <h2 className="text-2xl font-black text-white">Acceptance</h2>
                <p className="mt-2">
                  Continued use of VibeRush means you accept these terms.
                </p>
              </section>
            </div>
          </div>
        </section>
      </main>
    );
  }