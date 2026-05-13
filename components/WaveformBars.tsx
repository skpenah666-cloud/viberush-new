"use client";

const bars = [28, 48, 34, 72, 44, 88, 52, 68, 38, 80, 46, 62, 30, 74, 42, 58];

export default function WaveformBars() {
  return (
    <div className="flex h-16 w-full items-end gap-1 overflow-hidden rounded-2xl border border-zinc-800 bg-black/60 px-4 py-3">
      {bars.map((height, index) => (
        <span
          key={index}
          className="flex-1 rounded-full bg-gradient-to-t from-orange-700 via-orange-500 to-orange-300 opacity-80"
          style={{
            height: `${height}%`,
            animation: `waveformPulse ${0.7 + index * 0.04}s ease-in-out infinite alternate`,
          }}
        />
      ))}

      <style jsx>{`
        @keyframes waveformPulse {
          from {
            transform: scaleY(0.45);
            opacity: 0.45;
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