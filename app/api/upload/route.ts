import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

function getSupabase() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceKey) {
    throw new Error("Missing Supabase environment variables");
  }

  return createClient(supabaseUrl, serviceKey);
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    if (!body.url || !body.fileName) {
      return NextResponse.json(
        { error: "Missing Cloudinary URL or fileName" },
        { status: 400 }
      );
    }

    const supabase = getSupabase();

    const { data, error } = await supabase
      .from("songs")
      .insert({
        title: body.title || "Untitled",
        artist: body.artist || "Unknown Artist",
        url: body.url,
        file_name: body.fileName,
        resource_type: body.resourceType || "video",
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: "Supabase save failed", details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: "Saved",
      song: {
        id: data.id,
        title: data.title,
        artist: data.artist,
        url: data.url,
        fileName: data.file_name,
        resourceType: data.resource_type,
        createdAt: data.created_at,
      },
    });
  } catch (error: any) {
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
    const supabase = getSupabase();

    const { data, error } = await supabase
      .from("songs")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({ songs: [], details: error.message });
    }

    const songs = data.map((song) => ({
      id: song.id,
      title: song.title,
      artist: song.artist,
      url: song.url,
      fileName: song.file_name,
      resourceType: song.resource_type,
      createdAt: song.created_at,
    }));

    return NextResponse.json({ songs });
  } catch (error: any) {
    return NextResponse.json({
      songs: [],
      details: error?.message || String(error),
    });
  }
}

export async function DELETE(req: Request) {
  try {
    const { id } = await req.json();
    const supabase = getSupabase();

    const { data: song, error: findError } = await supabase
      .from("songs")
      .select("*")
      .eq("id", id)
      .single();

    if (findError || !song) {
      return NextResponse.json(
        { error: "Song not found" },
        { status: 404 }
      );
    }

    await cloudinary.uploader.destroy(song.file_name, {
      resource_type: song.resource_type || "video",
    });

    const { error: deleteError } = await supabase
      .from("songs")
      .delete()
      .eq("id", id);

    if (deleteError) {
      return NextResponse.json(
        { error: "Delete failed", details: deleteError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ message: "Deleted" });
  } catch (error: any) {
    return NextResponse.json(
      {
        error: "Delete failed",
        details: error?.message || String(error),
      },
      { status: 500 }
    );
  }
}