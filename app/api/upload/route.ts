import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const uploadDir = path.join(process.cwd(), "public", "uploads");
const dbPath = path.join(process.cwd(), "public", "uploads", "songs.json");

function readSongs() {
  if (!fs.existsSync(dbPath)) return [];
  return JSON.parse(fs.readFileSync(dbPath, "utf-8"));
}

function writeSongs(songs: any[]) {
  if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
  fs.writeFileSync(dbPath, JSON.stringify(songs, null, 2));
}

export async function POST(req: Request) {
  try {
    const formData = await req.formData();

    const file = formData.get("file") as File | null;
    const title = formData.get("title") as string;
    const artist = formData.get("artist") as string;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const uniqueName = Date.now() + "-" + file.name;
    const filePath = path.join(uploadDir, uniqueName);

    fs.writeFileSync(filePath, buffer);

    const songs = readSongs();

    const newSong = {
      id: Date.now().toString(),
      title: title || file.name.replace(/\.[^/.]+$/, ""),
      artist: artist || "Unknown Artist",
      url: `/uploads/${uniqueName}`,
      fileName: uniqueName,
      createdAt: new Date().toISOString(),
    };

    songs.unshift(newSong);
    writeSongs(songs);

    return NextResponse.json({
      message: "Upload successful",
      song: newSong,
    });
  } catch {
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}

export async function GET() {
  try {
    return NextResponse.json({ songs: readSongs() });
  } catch {
    return NextResponse.json({ songs: [] });
  }
}

export async function DELETE(req: Request) {
  try {
    const { id } = await req.json();

    const songs = readSongs();
    const song = songs.find((s: any) => s.id === id);

    if (song) {
      const filePath = path.join(uploadDir, song.fileName);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }

    const updatedSongs = songs.filter((s: any) => s.id !== id);
    writeSongs(updatedSongs);

    return NextResponse.json({ message: "Deleted" });
  } catch {
    return NextResponse.json({ error: "Delete failed" }, { status: 500 });
  }
}