// src/app/api/auth/user/route.ts
import { NextResponse } from 'next/server';
import prisma from '../../../../../lib/prisma';
import { checkDbConnection } from '@/utils/dbCheck';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(request: Request) {
  try {
    // Check DB connection
    const isConnected = await checkDbConnection();
    if (!isConnected) {
      return NextResponse.json({ error: 'Database connection failed' }, { status: 500 });
    }

    const { accessToken } = await request.json();
    
    if (!accessToken) {
      return NextResponse.json({ error: 'Access token is required' }, { status: 400 });
    }

    // Verify the token with Supabase
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);

    if (error || !user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // Check if user exists in your database
    let dbUser = await prisma.user.findUnique({
      where: { email: user.email! }
    });

    // If user doesn't exist, create them
    if (!dbUser) {
      dbUser = await prisma.user.create({
        data: {
          id: user.id, // Use Supabase's UUID
          name: user.user_metadata.full_name || user.email!.split('@')[0],
          email: user.email!
        }
      });
    }

    return NextResponse.json({ user: dbUser });
  } catch (error) {
    console.error('Error handling authentication:', error);
    return NextResponse.json({ error: 'Authentication failed' }, { status: 500 });
  }
}