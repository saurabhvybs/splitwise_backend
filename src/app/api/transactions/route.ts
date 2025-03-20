// src/app/api/transactions/route.ts
import { NextResponse } from 'next/server';
import prisma from '../../../../lib/prisma';
import { checkDbConnection } from '@/utils/dbCheck';

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

    const transactions = await prisma.transaction.findMany({
      where: {
        OR: [
          { payerId: userId },
          { participants: { some: { userId } } }
        ]
      },
      include: {
        payer: {
          select: { id: true, name: true, email: true }
        },
        participants: {
          include: {
            user: {
              select: { id: true, name: true, email: true }
            }
          }
        }
      },
      orderBy: {
        date: 'desc'
      }
    });
    
    return NextResponse.json({ transactions });
  } catch (error) {
    console.error('Error fetching transactions:', error);
    return NextResponse.json({ error: 'Failed to fetch transactions' }, { status: 500 });
  }
}