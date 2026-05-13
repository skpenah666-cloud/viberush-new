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
      return NextResponse.json({ error: "Login required." }, { status: 401 });
    }

    const supabase = getSupabase();

    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .maybeSingle();

    if (error) {
      return NextResponse.json(
        { error: "Failed to fetch profile", details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      profile: data || {
        id: user.id,
        username: "",
        display_name: "",
        bio: "",
        avatar_url: "",
        instagram: "",
        twitter: "",
        website: "",
      },
      email: user.email,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Profile fetch failed", details: error?.message || String(error) },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const user = await getUserFromRequest(req);

    if (!user) {
      return NextResponse.json({ error: "Login required." }, { status: 401 });
    }

    const body = await req.json();

    const username = String(body.username || "")
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9_]/g, "");

    if (!username) {
      return NextResponse.json(
        { error: "Username is required. Use letters, numbers, or underscores." },
        { status: 400 }
      );
    }

    const supabase = getSupabase();

    const { data: existingUsername } = await supabase
      .from("profiles")
      .select("id")
      .eq("username", username)
      .neq("id", user.id)
      .maybeSingle();

    if (existingUsername) {
      return NextResponse.json(
        { error: "Username is already taken." },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("profiles")
      .upsert({
        id: user.id,
        username,
        display_name: body.displayName || "",
        bio: body.bio || "",
        avatar_url: body.avatarUrl || "",
        instagram: body.instagram || "",
        twitter: body.twitter || "",
        website: body.website || "",
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: "Failed to save profile", details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ profile: data });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Profile save failed", details: error?.message || String(error) },
      { status: 500 }
    );
  }
}