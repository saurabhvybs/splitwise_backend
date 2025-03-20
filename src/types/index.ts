export interface Participant {
    userId: string;
    amount: number;
  }
  
 export interface SplitTransactionRequest {
    description: string;
    amount: number;
    payerId: string;
    participants: Participant[];
    category?: string;
    date?: Date;
  }
  
// Define the interface for the friendship object returned by Prisma
export interface PrismaFriendship {
  id: string;
  userId: string;
  friendId: string;
  status: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
  friend: {
    id: string;
    name: string;
    email: string;
  };
}