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

    const { count, error: countError } = await supabase
      .from("follows")
      .select("*", { count: "exact", head: true })
      .eq("artist_id", artistId);

    if (countError) {
      return NextResponse.json(
        { error: "Failed to count followers", details: countError.message },
        { status: 500 }
      );
    }

    let isFollowing = false;

    if (user) {
      const { data, error } = await supabase
        .from("follows")
        .select("id")
        .eq("artist_id", artistId)
        .eq("follower_id", user.id)
        .maybeSingle();

      if (error) {
        return NextResponse.json(
          { error: "Failed to check follow status", details: error.message },
          { status: 500 }
        );
      }

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

    const { data: existingFollow, error: existingError } = await supabase
      .from("follows")
      .select("id")
      .eq("follower_id", user.id)
      .eq("artist_id", artistId)
      .maybeSingle();

    if (existingError) {
      return NextResponse.json(
        { error: "Failed to check existing follow", details: existingError.message },
        { status: 500 }
      );
    }

    if (existingFollow) {
      const { error } = await supabase
        .from("follows")
        .delete()
        .eq("id", existingFollow.id);

      if (error) {
        return NextResponse.json(
          { error: "Failed to unfollow", details: error.message },
          { status: 500 }
        );
      }

      const { count } = await supabase
        .from("follows")
        .select("*", { count: "exact", head: true })
        .eq("artist_id", artistId);

      return NextResponse.json({
        isFollowing: false,
        followerCount: count || 0,
      });
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

    const { count } = await supabase
      .from("follows")
      .select("*", { count: "exact", head: true })
      .eq("artist_id", artistId);

    return NextResponse.json({
      isFollowing: true,
      followerCount: count || 0,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Follow failed", details: error?.message || String(error) },
      { status: 500 }
    );
  }
}