import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function GET() {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    const redirectTo = process.env.REACT_APP_REDIRECT_URL;

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options:  { redirectTo },
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json({ url: data.url }); //sending OAuth URL to the React Native app
  } catch {
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
