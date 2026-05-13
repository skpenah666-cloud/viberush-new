"use client";

export default function MusicVisualizer() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-3xl">
      <div className="absolute -left-20 top-10 h-48 w-48 animate-pulse rounded-full bg-orange-500/10 blur-3xl" />
      <div className="absolute -right-16 bottom-6 h-40 w-40 animate-pulse rounded-full bg-red-500/10 blur-3xl" />
      <div className="absolute left-1/2 top-1/2 h-32 w-32 -translate-x-1/2 -translate-y-1/2 animate-ping rounded-full bg-orange-400/5" />

      <div className="absolute bottom-0 left-0 right-0 flex h-24 items-end justify-center gap-2 px-6 opacity-40">
        {[35, 60, 45, 80, 50, 95, 65, 75, 40, 70, 55, 85].map(
          (height, index) => (
            <span
              key={index}
              className="w-2 rounded-full bg-orange-400"
              style={{
                height: `${height}%`,
                animation: `visualizerBounce ${
                  0.7 + index * 0.05
                }s ease-in-out infinite alternate`,
              }}
            />
          )
        )}
      </div>

      <style jsx>{`
        @keyframes visualizerBounce {
          from {
            transform: scaleY(0.4);
            opacity: 0.35;
          }
          to {
            transform: scaleY(1);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}