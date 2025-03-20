// src/utils/dbCheck.ts
import prisma from '../../lib/prisma';

export async function checkDbConnection() {
  try {
    // Test the connection with a simple query
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch (error) {
    console.error('Database connection failed:', error);
    return false;
  }
}