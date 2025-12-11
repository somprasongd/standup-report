import { NextRequest } from 'next/server';
import prisma, { ensureStandupColumns } from '@/lib/prisma';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { startOfDay, endOfDay } from 'date-fns';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user || !('id' in session.user)) {
      return new Response(
        JSON.stringify({ error: 'You must be logged in to check standup entries' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    // Get today's date range
    const today = new Date();
    const start = startOfDay(today);
    const end = endOfDay(today);
    
    await ensureStandupColumns();

    // Check if user already has an entry for today
    const existingEntry = await prisma.standupEntry.findFirst({
      where: {
        userId: (session.user as any).id,
        createdAt: {
          gte: start,
          lte: end,
        },
      },
    });
    
    if (existingEntry) {
      return new Response(
        JSON.stringify({ hasEntry: true, entry: existingEntry }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    } else {
      return new Response(
        JSON.stringify({ hasEntry: false }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }
  } catch (error) {
    console.error('Error checking standup entry:', error);
    
    return new Response(
      JSON.stringify({ error: 'Failed to check standup entry' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
