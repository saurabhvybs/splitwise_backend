// src/app/api/friends/add/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { checkDbConnection } from '@/utils/dbCheck';

interface AddFriendRequest {
  userId: string;
  friendId: string;
}

export async function POST(request: Request) {
  try {
    // Check DB connection
    const isConnected = await checkDbConnection();
    if (!isConnected) {
      return NextResponse.json({ error: 'Database connection failed' }, { status: 500 });
    }

    const body: AddFriendRequest = await request.json();
    const { userId, friendId } = body;
    
    if (!userId || !friendId) {
      return NextResponse.json({ 
        error: 'Both userId and friendId are required' 
      }, { status: 400 });
    }
    
    // Check if users exist
    const [user, friend] = await Promise.all([
      prisma.user.findUnique({ where: { id: userId } }),
      prisma.user.findUnique({ where: { id: friendId } })
    ]);
    
    if (!user || !friend) {
      return NextResponse.json({ error: 'User or friend not found' }, { status: 404 });
    }
    
    // Check if friendship already exists
    const existingFriendship = await prisma.friendship.findFirst({
      where: {
        OR: [
          { userId, friendId },
          { userId: friendId, friendId: userId }
        ]
      }
    });
    
    if (existingFriendship) {
      return NextResponse.json({ 
        error: 'Friendship already exists', 
        status: existingFriendship.status 
      }, { status: 400 });
    }
    
    // Create friendship
    const friendship = await prisma.friendship.create({
      data: {
        userId,
        friendId,
        status: 'PENDING'  // Initial status is pending until the friend accepts
      },
      include: {
        user: { select: { id: true, name: true, email: true } },
        friend: { select: { id: true, name: true, email: true } }
      }
    });
    
    return NextResponse.json({ 
      message: 'Friend request sent successfully',
      friendship
    });
  } catch (error) {
    console.error('Error adding friend:', error);
    return NextResponse.json({ error: 'Failed to add friend' }, { status: 500 });
  }
}