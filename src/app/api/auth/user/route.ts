import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function GET(req: NextRequest) {
  try {
    const token =req.headers.get("authorization")?.split("Bearer ")[1];

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABSE_URL!,
      process.env.NEXT_PUBLIC_SUPABSE_ANON_KEY!,
      { global: { headers: { Authorization: `Bearer ${token}` } } }
    );

    const { data, error } = await supabase.auth.getUser();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    console.log("user data", data); // Log the user data
    return NextResponse.json({ user: data.user });
  } catch {
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
