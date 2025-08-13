import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return new Response(
        JSON.stringify({ error: 'You must be logged in to submit a standup entry' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    const body = await request.json();
    
    const { name, yesterday, today, blockers } = body;
    
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
        name: session.user?.name || name,
        yesterday,
        today,
        blockers: blockers || null,
        userId: session.user?.id,
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
    const entries = await prisma.standupEntry.findMany({
      orderBy: {
        createdAt: 'desc',
      },
      take: 20, // Limit to last 20 entries
      include: {
        user: true,
      }
    });
    
    // Transform the data to match the client expectations
    const transformedEntries = entries.map(entry => ({
      ...entry,
      name: entry.user?.name || entry.name
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