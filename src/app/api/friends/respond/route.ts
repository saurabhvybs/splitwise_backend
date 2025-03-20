// src/app/api/friends/respond/route.ts
import { NextResponse } from 'next/server';
import prisma from '../../../../../lib/prisma';
import { checkDbConnection } from '@/utils/dbCheck';

interface FriendResponseRequest {
  friendshipId: string;
  response: 'ACCEPTED' | 'REJECTED';
  userId: string; // the responding user's ID (for validation)
}

export async function POST(request: Request) {
  try {
    // Check DB connection
    const isConnected = await checkDbConnection();
    if (!isConnected) {
      return NextResponse.json({ error: 'Database connection failed' }, { status: 500 });
    }

    const body: FriendResponseRequest = await request.json();
    const { friendshipId, response, userId } = body;
    
    if (!friendshipId || !response || !userId) {
      return NextResponse.json({ 
        error: 'friendshipId, response, and userId are required' 
      }, { status: 400 });
    }
    
    // Find the friendship
    const friendship = await prisma.friendship.findUnique({
      where: { id: friendshipId }
    });
    
    if (!friendship) {
      return NextResponse.json({ error: 'Friendship not found' }, { status: 404 });
    }
    
    // Verify that the responding user is the recipient of the friend request
    if (friendship.friendId !== userId) {
      return NextResponse.json({ 
        error: 'Only the friend request recipient can respond to this request' 
      }, { status: 403 });
    }
    
    // Update the friendship status
    const updatedFriendship = await prisma.friendship.update({
      where: { id: friendshipId },
      data: { status: response },
      include: {
        user: { select: { id: true, name: true, email: true } },
        friend: { select: { id: true, name: true, email: true } }
      }
    });
    
    return NextResponse.json({ 
      message: `Friend request ${response.toLowerCase()}`,
      friendship: updatedFriendship
    });
  } catch (error) {
    console.error('Error responding to friend request:', error);
    return NextResponse.json({ error: 'Failed to respond to friend request' }, { status: 500 });
  }
}