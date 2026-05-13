"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const genres = [
  "Afrobeats",
  "Dancehall",
  "Hip-Hop",
  "Gospel",
  "R&B",
  "Amapiano",
  "Other",
];

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [artist, setArtist] = useState("");
  const [genre, setGenre] = useState("Afrobeats");
  const [message, setMessage] = useState("");
  const [fileUrl, setFileUrl] = useState("");
  const [coverPreview, setCoverPreview] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    const checkUser = async () => {
      const { data } = await supabase.auth.getUser();
      setUserEmail(data.user?.email || null);
    };

    checkUser();
  }, []);

  const uploadToCloudinary = async (
    selectedFile: File,
    resourceType: "video" | "image",
    progressStart: number,
    progressEnd: number
  ) => {
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

    return new Promise<any>((resolve, reject) => {
      const xhr = new XMLHttpRequest();

      xhr.open(
        "POST",
        `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`
      );

      xhr.upload.addEventListener("progress", (event) => {
        if (event.lengthComputable) {
          const percent = Math.round(
            progressStart +
              (event.loaded / event.total) *
                (progressEnd - progressStart)
          );

          setUploadProgress(percent);
        }
      });

      xhr.onload = () => {
        const response = JSON.parse(xhr.responseText);

        if (xhr.status >= 200 && xhr.status < 300) {
          resolve(response);
        } else {
          reject(
            new Error(
              response?.error?.message || "Cloudinary upload failed"
            )
          );
        }
      };

      xhr.onerror = () => reject(new Error("Upload failed"));

      const cloudData = new FormData();
      cloudData.append("file", selectedFile);
      cloudData.append("upload_preset", uploadPreset || "");
      cloudData.append("folder", "viberush");

      xhr.send(cloudData);
    });
  };

  const handleSubmit = async () => {
    if (!file) return setMessage("Choose a music file first.");

    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token;

    if (!token) {
      setMessage("Please log in before uploading.");
      return;
    }

    try {
      setIsUploading(true);
      setUploadProgress(0);
      setMessage("Uploading audio...");
      setFileUrl("");

      const cloudinaryAudio = await uploadToCloudinary(
        file,
        "video",
        0,
        coverFile ? 70 : 90
      );

      let coverUrl = "";

      if (coverFile) {
        setMessage("Uploading cover art...");

        const cloudinaryCover = await uploadToCloudinary(
          coverFile,
          "image",
          70,
          90
        );

        coverUrl = cloudinaryCover.secure_url;
      }

      setUploadProgress(95);
      setMessage("Saving track to library...");

      const saveRes = await fetch("/api/upload", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: title || file.name.replace(/\.[^/.]+$/, ""),
          artist: artist || "Unknown Artist",
          genre,
          url: cloudinaryAudio.secure_url,
          fileName: cloudinaryAudio.public_id,
          resourceType: cloudinaryAudio.resource_type,
          coverUrl,
        }),
      });

      const saveData = await saveRes.json();

      if (!saveRes.ok) {
        console.error(saveData);

        return setMessage(
          saveData?.details ||
            saveData?.error ||
            "Saving to library failed."
        );
      }

      setUploadProgress(100);
      setMessage("Upload successful ✅");

      setFileUrl(cloudinaryAudio.secure_url);

      setTitle("");
      setArtist("");
      setGenre("Afrobeats");
      setFile(null);
      setCoverFile(null);
      setCoverPreview("");

      setTimeout(() => {
        setUploadProgress(0);
      }, 2000);
    } catch (error: any) {
      console.error(error);
      setMessage(error?.message || "Upload failed.");
      setUploadProgress(0);
    } finally {
      setIsUploading(false);
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUserEmail(null);
    setMessage("Logged out.");
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-black via-zinc-950 to-orange-950 text-white">
      <nav className="flex items-center justify-between border-b border-zinc-900 bg-black/60 p-6 backdrop-blur-xl">
        <a href="/" className="text-2xl font-black text-orange-500">
          VibeRush
        </a>

        <div className="flex items-center gap-3">
          {userEmail ? (
            <button
              onClick={logout}
              className="rounded-full border border-zinc-700 px-5 py-2 text-sm font-bold transition hover:bg-zinc-900"
            >
              Logout
            </button>
          ) : (
            <a
              href="/auth"
              className="rounded-full bg-orange-500 px-5 py-2 text-sm font-black text-black transition hover:bg-orange-400"
            >
              Login
            </a>
          )}

          <a
            href="/library"
            className="rounded-full border border-zinc-700 px-5 py-2 text-sm font-bold transition hover:bg-zinc-900"
          >
            Library
          </a>
        </div>
      </nav>

      <section className="mx-auto flex min-h-[80vh] max-w-2xl flex-col items-center justify-center px-6 py-10">
        <div className="w-full rounded-3xl border border-zinc-800 bg-zinc-950/80 p-8 shadow-2xl">
          <p className="mb-3 text-sm font-bold uppercase tracking-widest text-orange-400">
            Creator Upload
          </p>

          <h1 className="text-4xl font-black">Drop your next sound</h1>

          <p className="mt-3 text-zinc-400">
            Upload your audio, add cover art, genre, and publish it to your account.
          </p>

          {userEmail ? (
            <p className="mt-5 rounded-xl border border-green-900 bg-green-950/40 p-3 text-sm text-green-300">
              Logged in as {userEmail}
            </p>
          ) : (
            <div className="mt-5 rounded-xl border border-orange-900 bg-orange-950/40 p-4 text-sm text-orange-200">
              You must be logged in to upload.
            </div>
          )}

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

          <select
            value={genre}
            onChange={(e) => setGenre(e.target.value)}
            className="mt-4 w-full rounded-xl border border-zinc-800 bg-black p-4 text-white outline-none focus:border-orange-500"
          >
            {genres.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <label className="block cursor-pointer rounded-2xl border border-dashed border-orange-500/50 bg-black/60 p-7 text-center transition hover:bg-orange-500/10">
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
                Choose audio
              </span>

              <p className="mt-2 text-sm text-zinc-500">
                MP3, WAV, M4A
              </p>
            </label>

            <label className="block cursor-pointer rounded-2xl border border-dashed border-zinc-700 bg-black/60 p-7 text-center transition hover:bg-zinc-900">
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const selectedCover = e.target.files?.[0] || null;
                  setCoverFile(selectedCover);

                  if (selectedCover) {
                    setCoverPreview(URL.createObjectURL(selectedCover));
                  } else {
                    setCoverPreview("");
                  }
                }}
              />

              <span className="text-lg font-bold text-zinc-200">
                Add cover art
              </span>

              <p className="mt-2 text-sm text-zinc-500">
                Optional JPG, PNG
              </p>
            </label>
          </div>

          {(file || coverPreview) && (
            <div className="mt-5 grid gap-4 md:grid-cols-[1fr_140px]">
              {file && (
                <p className="rounded-xl bg-zinc-900 p-4 text-sm text-orange-300">
                  Audio selected: {file.name}
                </p>
              )}

              {coverPreview && (
                <img
                  src={coverPreview}
                  alt="Cover preview"
                  className="h-36 w-36 rounded-2xl border border-zinc-800 object-cover"
                />
              )}
            </div>
          )}

          {isUploading && (
            <div className="mt-6">
              <div className="mb-2 flex items-center justify-between text-sm">
                <span className="font-bold text-orange-300">
                  Uploading...
                </span>

                <span className="font-black text-orange-400">
                  {uploadProgress}%
                </span>
              </div>

              <div className="h-4 overflow-hidden rounded-full bg-zinc-800">
                <div
                  className="h-full rounded-full bg-orange-500 transition-all duration-300"
                  style={{
                    width: `${uploadProgress}%`,
                  }}
                />
              </div>
            </div>
          )}

          <button
            onClick={handleSubmit}
            disabled={isUploading || !userEmail}
            className="mt-6 w-full rounded-full bg-orange-500 px-6 py-4 font-black text-black transition hover:bg-orange-400 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isUploading ? "Uploading..." : "Upload Track"}
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