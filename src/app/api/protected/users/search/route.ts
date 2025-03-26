// src/app/api/users/search/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { checkDbConnection } from '@/utils/dbCheck';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');
  const currentUserId = searchParams.get('userId');
  
  if (!query) {
    return NextResponse.json({ error: 'Search query is required' }, { status: 400 });
  }

  if (!currentUserId) {
    return NextResponse.json({ error: 'Current user ID is required' }, { status: 400 });
  }

  try {
    // Check DB connection
    const isConnected = await checkDbConnection();
    if (!isConnected) {
      return NextResponse.json({ error: 'Database connection failed' }, { status: 500 });
    }

    // Find users that match the query but exclude the current user
    const users = await prisma.user.findMany({
      where: {
        AND: [
          {
            OR: [
              { name: { contains: query, mode: 'insensitive' } },
              { email: { contains: query, mode: 'insensitive' } }
            ]
          },
          { id: { not: currentUserId } }
        ]
      },
      select: {
        id: true,
        name: true,
        email: true
      },
      take: 10 // Limit results
    });
    
    return NextResponse.json({ users });
  } catch (error) {
    console.error('Error searching users:', error);
    return NextResponse.json({ error: 'Failed to search users' }, { status: 500 });
  }
}