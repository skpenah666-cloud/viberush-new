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
      return NextResponse.json({ message: "Not logged in" });
    }

    const { songId } = await req.json();

    if (!songId) {
      return NextResponse.json({ error: "Missing songId" }, { status: 400 });
    }

    const supabase = getSupabase();

    const { error } = await supabase.from("recently_played").insert({
      user_id: user.id,
      song_id: songId,
    });

    if (error) {
      return NextResponse.json(
        { error: "Failed to save recently played", details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ message: "Saved" });
  } catch (error: any) {
    return NextResponse.json(
      {
        error: "Recently played failed",
        details: error?.message || String(error),
      },
      { status: 500 }
    );
  }
}