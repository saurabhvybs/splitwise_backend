import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: NextRequest) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    );
    await supabase.auth.signOut();

    return NextResponse.json({ message: "Logged out successfully" });
  } catch {
    return NextResponse.json( { error: "Internal Server Error" },  { status: 500 }
    );
  }
}
