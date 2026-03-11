import { NextResponse } from "next/server";
import {
  createSupabaseClient,
  createSupabaseServiceClient,
} from "@/lib/supabase/server";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function GET() {
  const supabase = createSupabaseClient();
  if (!supabase) {
    return NextResponse.json({ error: "DB connection error" }, { status: 500 });
  }
  const { data, error } = await supabase.rpc("waitlist_count");
  if (error) {
    console.error(error);
    return NextResponse.json({ count: 0 });
  }
  return NextResponse.json({ count: data });
}

export async function POST(request: Request) {
  let body: { email?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const email = body.email?.trim().toLowerCase();

  if (!email || !EMAIL_REGEX.test(email)) {
    return NextResponse.json(
      { error: "Invalid email address" },
      { status: 400 },
    );
  }

  const supabase = createSupabaseClient();

  if (!supabase) {
    return NextResponse.json({ error: "DB connection error" }, { status: 500 });
  }

  // Insert; swallow duplicate conflict
  const { error } = await supabase.from("waitlist").insert({ email });

  if (error && error.code !== "23505") {
    console.error(error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 },
    );
  }

  // Lookup position using service role (bypasses RLS)
  const serviceClient = createSupabaseServiceClient();
  let position: number | null = null;

  if (serviceClient) {
    const { data } = await serviceClient.rpc("waitlist_position", {
      lookup_email: email,
    });
    if (data) position = data;
  }

  return NextResponse.json(
    { message: "Joined waitlist", position },
    { status: 201 },
  );
}
