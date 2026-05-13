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
    const { searchParams } = new URL(req.url);
    const songId = searchParams.get("songId");

    if (!songId) {
      return NextResponse.json(
        { error: "Missing songId" },
        { status: 400 }
      );
    }

    const supabase = getSupabase();

    const { data, error } = await supabase
      .from("comments")
      .select("*")
      .eq("song_id", songId)
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json(
        { error: "Failed to fetch comments", details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ comments: data || [] });
  } catch (error: any) {
    return NextResponse.json(
      {
        error: "Failed to fetch comments",
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
        { error: "You must be logged in to comment." },
        { status: 401 }
      );
    }

    const { songId, body } = await req.json();

    if (!songId || !body?.trim()) {
      return NextResponse.json(
        { error: "Missing songId or comment body." },
        { status: 400 }
      );
    }

    const supabase = getSupabase();

    const { data, error } = await supabase
      .from("comments")
      .insert({
        song_id: songId,
        user_id: user.id,
        user_email: user.email,
        body: body.trim(),
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: "Failed to save comment", details: error.message },
        { status: 500 }
      );
    }

    const { data: song } = await supabase
      .from("songs")
      .select("id, title, user_id")
      .eq("id", songId)
      .maybeSingle();

    if (song?.user_id && song.user_id !== user.id) {
      await supabase.from("notifications").insert({
        user_id: song.user_id,
        type: "comment",
        message: `${user.email || "Someone"} commented on your song "${song.title}".`,
        link: `/song/${song.id}`,
      });
    }

    return NextResponse.json({ comment: data });
  } catch (error: any) {
    return NextResponse.json(
      {
        error: "Failed to save comment",
        details: error?.message || String(error),
      },
      { status: 500 }
    );
  }
}