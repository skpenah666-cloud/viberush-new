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
      return NextResponse.json({ likedSongIds: [] });
    }

    const supabase = getSupabase();

    const { data, error } = await supabase
      .from("likes")
      .select("song_id")
      .eq("user_id", user.id);

    if (error) {
      return NextResponse.json(
        { error: "Failed to fetch likes", details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      likedSongIds: data.map((like) => like.song_id),
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Failed to fetch likes", details: error?.message || String(error) },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const user = await getUserFromRequest(req);

    if (!user) {
      return NextResponse.json(
        { error: "You must be logged in to like songs." },
        { status: 401 }
      );
    }

    const { songId } = await req.json();

    if (!songId) {
      return NextResponse.json({ error: "Missing songId" }, { status: 400 });
    }

    const supabase = getSupabase();

    const { data: existingLike } = await supabase
      .from("likes")
      .select("*")
      .eq("user_id", user.id)
      .eq("song_id", songId)
      .maybeSingle();

    if (existingLike) {
      const { error } = await supabase
        .from("likes")
        .delete()
        .eq("user_id", user.id)
        .eq("song_id", songId);

      if (error) {
        return NextResponse.json(
          { error: "Failed to unlike song", details: error.message },
          { status: 500 }
        );
      }

      return NextResponse.json({ liked: false });
    }

    const { error } = await supabase.from("likes").insert({
      user_id: user.id,
      song_id: songId,
    });

    if (error) {
      return NextResponse.json(
        { error: "Failed to like song", details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ liked: true });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Like failed", details: error?.message || String(error) },
      { status: 500 }
    );
  }
}