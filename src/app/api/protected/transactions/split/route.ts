// src/app/api/transactions/split/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { checkDbConnection } from '@/utils/dbCheck';
import { Participant,SplitTransactionRequest } from '@/types';

export async function POST(request: Request) {
  try {
    // Check DB connection
    const isConnected = await checkDbConnection();
    if (!isConnected) {
      return NextResponse.json({ error: 'Database connection failed' }, { status: 500 });
    }

    const body: SplitTransactionRequest = await request.json();
    const { description, amount, payerId, participants, category, date = new Date() } = body;
    
    // Validation
    if (!description || !amount || !payerId || !participants || !participants.length) {
      return NextResponse.json({ 
        error: 'Missing required fields: description, amount, payerId, participants' 
      }, { status: 400 });
    }
    
    // Create the transaction
    const transaction = await prisma.transaction.create({
      data: { description, amount, date, category, payerId},
      include: { payer: true }
    });
    
    // Create transaction participants
    const participantPromises = participants.map(participant => 
      prisma.transactionParticipant.create({
        data: {
          transactionId: transaction.id,
          userId: participant.userId,
          amount: participant.amount,
          settled: false
        }
      })
    );
    
    await Promise.all(participantPromises);
    
    // Fetch complete transaction with participants
    const completeTransaction = await prisma.transaction.findUnique({
      where: { id: transaction.id },
      include: {
        payer: true,
        participants: { include: { user: true } }
      }
    });
    
    return NextResponse.json({ 
      message: 'Transaction split successfully',
      transaction: completeTransaction 
    });
  } catch (error) {
    console.error('Error splitting transaction:', error);
    return NextResponse.json({ error: 'Failed to split transaction' }, { status: 500 });
  }
}