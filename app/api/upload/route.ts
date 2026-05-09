import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadDir = path.join(process.cwd(), "public", "uploads");
const dbPath = path.join(process.cwd(), "public", "uploads", "songs.json");

function readSongs() {
  if (!fs.existsSync(dbPath)) return [];
  return JSON.parse(fs.readFileSync(dbPath, "utf-8"));
}

function writeSongs(songs: any[]) {
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  fs.writeFileSync(dbPath, JSON.stringify(songs, null, 2));
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const newSong = {
      id: Date.now().toString(),
      title: body.title || "Untitled",
      artist: body.artist || "Unknown Artist",
      url: body.url,
      fileName: body.fileName,
      resourceType: body.resourceType || "video",
      createdAt: new Date().toISOString(),
    };

    const songs = readSongs();
    songs.unshift(newSong);
    writeSongs(songs);

    return NextResponse.json({
      message: "Saved",
      song: newSong,
    });
  } catch (error: any) {
    console.error("SAVE ERROR:", error);

    return NextResponse.json(
      {
        error: "Save failed",
        details: error?.message || String(error),
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    return NextResponse.json({
      songs: readSongs(),
    });
  } catch {
    return NextResponse.json({
      songs: [],
    });
  }
}

export async function DELETE(req: Request) {
  try {
    const { id } = await req.json();

    const songs = readSongs();
    const song = songs.find((s: any) => s.id === id);

    if (song) {
      await cloudinary.uploader.destroy(song.fileName, {
        resource_type: song.resourceType || "video",
      });
    }

    const updatedSongs = songs.filter((s: any) => s.id !== id);
    writeSongs(updatedSongs);

    return NextResponse.json({
      message: "Deleted",
    });
  } catch (error: any) {
    console.error("DELETE ERROR:", error);

    return NextResponse.json(
      {
        error: "Delete failed",
        details: error?.message || String(error),
      },
      { status: 500 }
    );
  }
}