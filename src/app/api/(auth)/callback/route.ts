// src/app/api/(auth)/callback/route.ts
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const requestUrl = new URL(request.url);
    const code = requestUrl.searchParams.get('code');
    
    if (!code) {
      return NextResponse.redirect(new URL('/login?error=missing_code', request.url));
    }
    
    const supabase = createRouteHandlerClient({ cookies });
    
    // Exchange the code for a session
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    
    if (error) {
      console.error('Session exchange error:', error);
      return NextResponse.redirect(new URL(`/login?error=${error.message}`, request.url));
    }
    
    // Get user data after successful authentication
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
      // Sync with your Prisma database
      await syncUserWithPrisma(user);
    }
    
    // Redirect to dashboard after successful login
    return NextResponse.redirect(new URL('/dashboard', request.url));
  } catch (error) {
    console.error('Callback error:', error);
    return NextResponse.redirect(new URL('/login?error=unknown', request.url));
  }
}

async function syncUserWithPrisma(user: any) {
  try {
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: user.email },
    });
    
    if (existingUser) {
      // Update existing user
      await prisma.user.update({
        where: { id: existingUser.id },
        data: {
          providerId: user.id,
          provider: user.app_metadata?.provider || null,
          avatar: user.user_metadata?.avatar_url || null,
          updatedAt: new Date(),
        },
      });
    } else {
      // Create new user
      await prisma.user.create({
        data: {
          email: user.email,
          name: user.user_metadata?.full_name || 'New User',
          providerId: user.id,
          provider: user.app_metadata?.provider || null,
          avatar: user.user_metadata?.avatar_url || null,
        },
      });
    }
  } catch (error) {
    console.error('Error syncing user with Prisma:', error);
  }
}