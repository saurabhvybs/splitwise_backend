// src/middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// This function can be marked `async` if using `await` inside
export async function middleware(request: NextRequest) {
  // Skip auth for the auth API routes themselves
  if (request.nextUrl.pathname.startsWith('/api/auth')) {
    return NextResponse.next();
  }
  
  // Only run on API routes
  if (request.nextUrl.pathname.startsWith('/api/')) {
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    
    try {
      // Initialize Supabase admin client
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
      const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
      const supabase = createClient(supabaseUrl, supabaseServiceKey);
      
      // Verify the token
      const { data: { user }, error } = await supabase.auth.getUser(token);
      
      if (error || !user) {
        return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
      }
      
      // Add user info to request headers for use in API routes
      const requestHeaders = new Headers(request.headers);
      requestHeaders.set('x-user-id', user.id);
      requestHeaders.set('x-user-email', user.email || '');
      
      // Return modified request
      return NextResponse.next({
        request: {
          headers: requestHeaders,
        }
      });
    } catch (error) {
      console.error('Auth middleware error:', error);
      return NextResponse.json({ error: 'Authentication failed' }, { status: 500 });
    }
  }
  
  // Continue for non-API routes
  return NextResponse.next();
}

// Configure which paths the middleware runs on
export const config = {
  matcher: [
    // Apply to all API routes except auth routes
    '/api/:path*',
  ],
};