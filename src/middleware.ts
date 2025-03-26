import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function middleware(req: NextRequest) {
  const token = req.headers.get("authorization")?.split("Bearer ")[1];

  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABSE_URL!,
    process.env.NEXT_PUBLIC_SUPABSE_ANON_KEY!,
    { global: { headers: { Authorization: `Bearer ${token}` } } }
  );
  const { data: user, error } = await supabase.auth.getUser();

  if (error || !user) {
    return NextResponse.json({ error: "Invalid Token" }, { status: 401 });
  }
  return NextResponse.next();
}

export const config = {
  matcher: "/api/protected/:path*",
};
