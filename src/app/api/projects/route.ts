import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

// GET /api/projects - Get all projects
export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search') || '';
    
    const projects = await prisma.project.findMany({
      where: {
        OR: [
          {
            name: {
              contains: search,
              mode: 'insensitive'
            }
          },
          {
            code: {
              contains: search,
              mode: 'insensitive'
            }
          },
          {
            description: {
              contains: search,
              mode: 'insensitive'
            }
          }
        ]
      },
      orderBy: {
        createdAt: 'desc'
      },
      include: {
        createdBy: {
          select: {
            name: true,
            email: true,
            image: true
          }
        }
      }
    });
    
    return NextResponse.json(projects);
  } catch (error) {
    console.error("Error fetching projects:", error);
    return NextResponse.json({ error: "Failed to fetch projects" }, { status: 500 });
  }
}

// POST /api/projects - Create a new project
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user || !('id' in session.user)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const { name, code, description } = await req.json();
    
    // Validation
    if (!name || !code) {
      return NextResponse.json({ error: "Name and code are required" }, { status: 400 });
    }
    
    // Check if code already exists
    const existingProject = await prisma.project.findUnique({
      where: { code }
    });
    
    if (existingProject) {
      return NextResponse.json({ error: "Project code already exists" }, { status: 400 });
    }
    
    const project = await prisma.project.create({
      data: {
        name,
        code,
        description,
        createdById: (session.user as { id: string }).id
      }
    });
    
    return NextResponse.json(project);
  } catch (error) {
    console.error("Error creating project:", error);
    return NextResponse.json({ error: "Failed to create project" }, { status: 500 });
  }
}