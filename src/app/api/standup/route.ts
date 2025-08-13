import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { startOfDay, endOfDay } from 'date-fns';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user || !('id' in session.user)) {
      return new Response(
        JSON.stringify({ error: 'You must be logged in to submit a standup entry' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    const body = await request.json();
    
    const { yesterday, today, blockers } = body;
    
    // Validate required fields
    if (!yesterday || !today) {
      return new Response(
        JSON.stringify({ error: 'Yesterday and today fields are required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    // Create new standup entry
    const standupEntry = await prisma.standupEntry.create({
      data: {
        yesterday,
        today,
        blockers: blockers || null,
        userId: (session.user as { id: string }).id,
      },
    });
    
    return new Response(
      JSON.stringify(standupEntry),
      { status: 201, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error creating standup entry:', error);
    
    return new Response(
      JSON.stringify({ error: 'Failed to create standup entry' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // Get the date parameter from the query string
    const { searchParams } = new URL(request.url);
    const dateParam = searchParams.get('date');
    
    // If no date is provided, use today's date
    const targetDate = dateParam ? new Date(dateParam) : new Date();
    
    // Set the start and end of the target day
    const start = startOfDay(targetDate);
    const end = endOfDay(targetDate);
    
    const entries = await prisma.standupEntry.findMany({
      where: {
        createdAt: {
          gte: start,
          lte: end,
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          }
        },
      }
    });
    
    // Transform the data to match the client expectations
    const transformedEntries = entries.map((entry: any) => ({
      ...entry,
      name: entry.user?.name || 'Anonymous'
    }));
    
    return new Response(
      JSON.stringify(transformedEntries),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error fetching standup entries:', error);
    
    return new Response(
      JSON.stringify({ error: 'Failed to fetch standup entries' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}