import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { isToday } from 'date-fns';

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return new Response(
        JSON.stringify({ error: 'You must be logged in to update a standup entry' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    const id = params.id;
    
    // Check if the entry exists and belongs to the current user
    const existingEntry = await prisma.standupEntry.findUnique({
      where: { id: parseInt(id) },
    });
    
    if (!existingEntry) {
      return new Response(
        JSON.stringify({ error: 'Standup entry not found' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    // Check if the entry belongs to the current user
    // NextAuth stores the user ID in session.user.id
    if (existingEntry.userId !== session.user?.id) {
      return new Response(
        JSON.stringify({ error: 'You can only update your own standup entries' }),
        { status: 403, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    // Check if the entry is from today
    if (!isToday(existingEntry.createdAt)) {
      return new Response(
        JSON.stringify({ error: 'You can only update today\'s standup entries' }),
        { status: 403, headers: { 'Content-Type': 'application/json' } }
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
    
    // Update the standup entry
    const updatedEntry = await prisma.standupEntry.update({
      where: { id: parseInt(id) },
      data: {
        name: session.user?.name || name,
        yesterday,
        today,
        blockers: blockers || null,
        userId: session.user?.id,
      },
    });
    
    return new Response(
      JSON.stringify(updatedEntry),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error updating standup entry:', error);
    
    return new Response(
      JSON.stringify({ error: 'Failed to update standup entry' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}