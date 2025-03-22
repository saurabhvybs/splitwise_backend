// src/app/api/(auth)/login/route.ts
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const provider = searchParams.get('provider');
  
  if (!provider) {
    return NextResponse.json({ error: 'Provider is required' }, { status: 400 });
  }
  
  // Make sure this URL matches your App Router structure
  // const redirectTo = `https://unuapdwbxmnqdymuhrpz.supabase.co/auth/v1/callback`;
  const redirectTo = `http://localhost:3000/api/callback`;
  
  const supabase = createRouteHandlerClient({ cookies });
  
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: provider as any,
    options: { redirectTo },
  });
  
  if (error) {
    console.error('OAuth error:', error);
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
  
  return NextResponse.redirect(data.url);
}