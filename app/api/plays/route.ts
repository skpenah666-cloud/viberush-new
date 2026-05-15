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

    const { count, error } = await supabase
      .from("plays")
      .select("*", { count: "exact", head: true })
      .eq("song_id", songId);

    if (error) {
      return NextResponse.json(
        { error: "Failed to count plays", details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      playCount: count || 0,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Failed to fetch plays", details: error?.message || String(error) },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const user = await getUserFromRequest(req);
    const { songId } = await req.json();

    if (!songId) {
      return NextResponse.json(
        { error: "Missing songId" },
        { status: 400 }
      );
    }

    const supabase = getSupabase();

    const { error } = await supabase.from("plays").insert({
      song_id: songId,
      user_id: user?.id || null,
    });

    if (error) {
      return NextResponse.json(
        { error: "Failed to track play", details: error.message },
        { status: 500 }
      );
    }

    const { count } = await supabase
      .from("plays")
      .select("*", { count: "exact", head: true })
      .eq("song_id", songId);

    return NextResponse.json({
      tracked: true,
      playCount: count || 0,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Play tracking failed", details: error?.message || String(error) },
      { status: 500 }
    );
  }
}