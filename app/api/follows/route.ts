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
    const artistId = searchParams.get("artistId");

    if (!artistId) {
      return NextResponse.json({ error: "Missing artistId" }, { status: 400 });
    }

    const user = await getUserFromRequest(req);
    const supabase = getSupabase();

    const { count } = await supabase
      .from("follows")
      .select("*", { count: "exact", head: true })
      .eq("artist_id", artistId);

    let isFollowing = false;

    if (user) {
      const { data } = await supabase
        .from("follows")
        .select("*")
        .eq("artist_id", artistId)
        .eq("follower_id", user.id)
        .maybeSingle();

      isFollowing = !!data;
    }

    return NextResponse.json({
      followerCount: count || 0,
      isFollowing,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        error: "Failed to fetch follows",
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
        { error: "You must be logged in to follow artists." },
        { status: 401 }
      );
    }

    const { artistId } = await req.json();

    if (!artistId) {
      return NextResponse.json({ error: "Missing artistId" }, { status: 400 });
    }

    if (artistId === user.id) {
      return NextResponse.json(
        { error: "You cannot follow yourself." },
        { status: 400 }
      );
    }

    const supabase = getSupabase();

    const { data: existingFollow } = await supabase
      .from("follows")
      .select("*")
      .eq("follower_id", user.id)
      .eq("artist_id", artistId)
      .maybeSingle();

    if (existingFollow) {
      const { error } = await supabase
        .from("follows")
        .delete()
        .eq("follower_id", user.id)
        .eq("artist_id", artistId);

      if (error) {
        return NextResponse.json(
          { error: "Failed to unfollow", details: error.message },
          { status: 500 }
        );
      }

      return NextResponse.json({ isFollowing: false });
    }

    const { error } = await supabase.from("follows").insert({
      follower_id: user.id,
      artist_id: artistId,
    });

    if (error) {
      return NextResponse.json(
        { error: "Failed to follow", details: error.message },
        { status: 500 }
      );
    }

    await supabase.from("notifications").insert({
      user_id: artistId,
      type: "follow",
      message: `${user.email || "Someone"} followed your artist profile.`,
      link: `/artist/${artistId}`,
    });

    return NextResponse.json({ isFollowing: true });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Follow failed", details: error?.message || String(error) },
      { status: 500 }
    );
  }
}