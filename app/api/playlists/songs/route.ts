import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function getSupabase() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceKey) {
    throw new Error("Missing Supabase environment variables");
  }

  return createClient(supabaseUrl, serviceKey);
}

async function getUserFromRequest(req: Request) {
  const authHeader = req.headers.get("authorization");
  const token = authHeader?.replace("Bearer ", "");

  if (!token) return null;

  const supabase = getSupabase();
  const { data, error } = await supabase.auth.getUser(token);

  if (error || !data.user) return null;

  return data.user;
}

export async function POST(req: Request) {
  try {
    const user = await getUserFromRequest(req);

    if (!user) {
      return NextResponse.json(
        { error: "You must be logged in." },
        { status: 401 }
      );
    }

    const { playlistId, songId } = await req.json();

    if (!playlistId || !songId) {
      return NextResponse.json(
        { error: "Missing playlistId or songId." },
        { status: 400 }
      );
    }

    const supabase = getSupabase();

    const { data: playlist } = await supabase
      .from("playlists")
      .select("*")
      .eq("id", playlistId)
      .eq("user_id", user.id)
      .single();

    if (!playlist) {
      return NextResponse.json(
        { error: "Playlist not found." },
        { status: 404 }
      );
    }

    const { error } = await supabase.from("playlist_songs").insert({
      playlist_id: playlistId,
      song_id: songId,
    });

    if (error) {
      return NextResponse.json(
        { error: "Could not add song to playlist.", details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ message: "Added to playlist" });
  } catch (error: any) {
    return NextResponse.json(
      {
        error: "Failed to add song",
        details: error?.message || String(error),
      },
      { status: 500 }
    );
  }
}