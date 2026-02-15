import { NextResponse } from "next/server";
import { createSupabaseClient } from "@/lib/supabase/server";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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
      { status: 400 }
    );
  }

  const supabase = createSupabaseClient();

  if (!supabase) {
    return NextResponse.json({ error: "DB connection error" }, { status: 500 });
  }

  const { error } = await supabase.from("waitlist").insert({ email });

  if (error) {
    console.error(error);
    if (error.code === "23505") {
      return NextResponse.json({ message: "Joined waitlist" }, { status: 201 });
    }
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }

  return NextResponse.json({ message: "Joined waitlist" }, { status: 201 });
}
