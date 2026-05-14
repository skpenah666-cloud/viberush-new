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

async function getSongLikeCount(songId: string) {
  const supabase = getSupabase();

  const { count } = await supabase
    .from("likes")
    .select("*", { count: "exact", head: true })
    .eq("song_id", songId);

  return count || 0;
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const songId = searchParams.get("songId");

    const user = await getUserFromRequest(req);
    const supabase = getSupabase();

    if (songId) {
      const { count, error: countError } = await supabase
        .from("likes")
        .select("*", { count: "exact", head: true })
        .eq("song_id", songId);

      if (countError) {
        return NextResponse.json(
          { error: "Failed to count likes", details: countError.message },
          { status: 500 }
        );
      }

      let liked = false;

      if (user) {
        const { data, error } = await supabase
          .from("likes")
          .select("id")
          .eq("user_id", user.id)
          .eq("song_id", songId)
          .maybeSingle();

        if (error) {
          return NextResponse.json(
            { error: "Failed to check like status", details: error.message },
            { status: 500 }
          );
        }

        liked = !!data;
      }

      return NextResponse.json({
        liked,
        likeCount: count || 0,
      });
    }

    if (!user) {
      return NextResponse.json({ likedSongIds: [] });
    }

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
      {
        error: "Failed to fetch likes",
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
        { error: "You must be logged in to like songs." },
        { status: 401 }
      );
    }

    const { songId } = await req.json();

    if (!songId) {
      return NextResponse.json({ error: "Missing songId" }, { status: 400 });
    }

    const supabase = getSupabase();

    const { data: existingLike, error: existingError } = await supabase
      .from("likes")
      .select("id")
      .eq("user_id", user.id)
      .eq("song_id", songId)
      .maybeSingle();

    if (existingError) {
      return NextResponse.json(
        { error: "Failed to check existing like", details: existingError.message },
        { status: 500 }
      );
    }

    if (existingLike) {
      const { error } = await supabase
        .from("likes")
        .delete()
        .eq("id", existingLike.id);

      if (error) {
        return NextResponse.json(
          { error: "Failed to unlike song", details: error.message },
          { status: 500 }
        );
      }

      const likeCount = await getSongLikeCount(songId);

      return NextResponse.json({
        liked: false,
        likeCount,
      });
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

    const { data: song } = await supabase
      .from("songs")
      .select("id, title, user_id")
      .eq("id", songId)
      .maybeSingle();

    if (song?.user_id && song.user_id !== user.id) {
      await supabase.from("notifications").insert({
        user_id: song.user_id,
        type: "like",
        message: `${user.email || "Someone"} liked your song "${song.title}".`,
        link: `/song/${song.id}`,
      });
    }

    const likeCount = await getSongLikeCount(songId);

    return NextResponse.json({
      liked: true,
      likeCount,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Like failed", details: error?.message || String(error) },
      { status: 500 }
    );
  }
}