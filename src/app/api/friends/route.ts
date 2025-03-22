// src/app/api/friends/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { checkDbConnection } from '@/utils/dbCheck';
import { PrismaFriendship } from '@/types';


export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');
  
  if (!userId) {
    return NextResponse.json({ error: 'userId is required' }, { status: 400 });
  }

  try {
    // Check DB connection
    const isConnected = await checkDbConnection();
    if (!isConnected) {
      return NextResponse.json({ error: 'Database connection failed' }, { status: 500 });
    }

    // Fetching friends where the relationship is confirmed
    const friends = await prisma.friendship.findMany({
      where: {
        OR: [
          { userId: userId, status: 'ACCEPTED' },
          { friendId: userId, status: 'ACCEPTED' }
        ]
      },
      include: {
        user: { select: { id: true, name: true, email: true } },
        friend: { select: { id: true, name: true, email: true } }
      }
    });
    
    // Transform the data to return just the friend information
    const formattedFriends = friends.map((friendship: PrismaFriendship) => {
      // If the current user is the user in the friendship, return the friend details
      if (friendship.userId === userId) {
        return {
          id: friendship.friendId,
          name: friendship.friend.name,
          email: friendship.friend.email
        };
      } else {
        // Otherwise, return the user details
        return {
          id: friendship.userId,
          name: friendship.user.name,
          email: friendship.user.email
        };
      }
    });
    
    return NextResponse.json({ friends: formattedFriends });
  } catch (error) {
    console.error('Error fetching friends:', error);
    return NextResponse.json({ error: 'Failed to fetch friends' }, { status: 500 });
  }
}