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

export async function GET(req: Request) {
  try {
    const user = await getUserFromRequest(req);

    if (!user) {
      return NextResponse.json({ playlists: [] });
    }

    const supabase = getSupabase();

    const { data, error } = await supabase
      .from("playlists")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json(
        { error: "Failed to fetch playlists", details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ playlists: data });
  } catch (error: any) {
    return NextResponse.json(
      {
        error: "Failed to fetch playlists",
        details: error?.message || String(error),
      },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const user = await getUserFromRequest(req);

    if (!user) {
      return NextResponse.json(
        { error: "You must be logged in to create playlists." },
        { status: 401 }
      );
    }

    const { name } = await req.json();

    if (!name) {
      return NextResponse.json(
        { error: "Playlist name is required." },
        { status: 400 }
      );
    }

    const supabase = getSupabase();

    const { data, error } = await supabase
      .from("playlists")
      .insert({
        user_id: user.id,
        name,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: "Failed to create playlist", details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ playlist: data });
  } catch (error: any) {
    return NextResponse.json(
      {
        error: "Failed to create playlist",
        details: error?.message || String(error),
      },
      { status: 500 }
    );
  }
}