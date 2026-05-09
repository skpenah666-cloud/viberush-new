"use client";

import { useState } from "react";

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [artist, setArtist] = useState("");
  const [message, setMessage] = useState("");
  const [fileUrl, setFileUrl] = useState("");

  const handleSubmit = async () => {
    if (!file) return setMessage("Choose a music file first.");

    setMessage("Uploading to Cloudinary...");
    setFileUrl("");

    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

    const cloudData = new FormData();
    cloudData.append("file", file);
    cloudData.append("upload_preset", uploadPreset || "");
    cloudData.append("folder", "viberush");
    cloudData.append("resource_type", "video");

    const cloudRes = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/video/upload`,
      {
        method: "POST",
        body: cloudData,
      }
    );

    const cloudinaryFile = await cloudRes.json();

    if (!cloudRes.ok) {
      console.error(cloudinaryFile);
      return setMessage("Cloudinary upload failed.");
    }

    setMessage("Saving track...");

    const saveRes = await fetch("/api/upload", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title: title || file.name.replace(/\.[^/.]+$/, ""),
        artist: artist || "Unknown Artist",
        url: cloudinaryFile.secure_url,
        fileName: cloudinaryFile.public_id,
        resourceType: cloudinaryFile.resource_type,
      }),
    });

    if (!saveRes.ok) {
      return setMessage("Uploaded to Cloudinary, but saving to library failed.");
    }

    setMessage("Upload successful ✅");
    setFileUrl(cloudinaryFile.secure_url);
    setTitle("");
    setArtist("");
    setFile(null);
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-black via-zinc-950 to-orange-950 text-white">
      <nav className="flex items-center justify-between p-6">
        <a href="/" className="text-2xl font-bold text-orange-500">
          VibeRush
        </a>

        <a
          href="/library"
          className="rounded-full border border-zinc-700 px-5 py-2 text-sm font-bold transition hover:bg-zinc-900 active:scale-95"
        >
          Library
        </a>
      </nav>

      <section className="mx-auto flex min-h-[80vh] max-w-xl flex-col items-center justify-center px-6">
        <div className="w-full rounded-3xl border border-zinc-800 bg-zinc-950/80 p-8 shadow-2xl">
          <p className="mb-3 text-sm font-bold uppercase tracking-widest text-orange-400">
            Creator Upload
          </p>

          <h1 className="text-4xl font-black">Drop your next sound</h1>

          <p className="mt-3 text-zinc-400">
            Add your track details, upload your audio, and preview instantly.
          </p>

          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Song title"
            className="mt-8 w-full rounded-xl border border-zinc-800 bg-black p-4 text-white outline-none focus:border-orange-500"
          />

          <input
            value={artist}
            onChange={(e) => setArtist(e.target.value)}
            placeholder="Artist name"
            className="mt-4 w-full rounded-xl border border-zinc-800 bg-black p-4 text-white outline-none focus:border-orange-500"
          />

          <label className="mt-6 block cursor-pointer rounded-2xl border border-dashed border-orange-500/50 bg-black/60 p-8 text-center transition hover:bg-orange-500/10 active:scale-95">
            <input
              type="file"
              accept="audio/*"
              className="hidden"
              onChange={(e) => {
                setFile(e.target.files?.[0] || null);
                setMessage("");
                setFileUrl("");
              }}
            />

            <span className="text-lg font-bold text-orange-400">
              Choose audio file
            </span>

            <p className="mt-2 text-sm text-zinc-500">
              MP3, WAV, M4A supported
            </p>
          </label>

          {file && (
            <p className="mt-5 rounded-xl bg-zinc-900 p-4 text-sm text-orange-300">
              Selected: {file.name}
            </p>
          )}

          <button
            onClick={handleSubmit}
            className="mt-6 w-full rounded-full bg-orange-500 px-6 py-4 font-black text-black transition hover:bg-orange-400 active:scale-95"
          >
            Upload Track
          </button>

          {message && (
            <p className="mt-5 text-center font-semibold text-green-400">
              {message}
            </p>
          )}

          {fileUrl && (
            <audio controls className="mt-6 w-full">
              <source src={fileUrl} />
            </audio>
          )}
        </div>
      </section>
    </main>
  );
}