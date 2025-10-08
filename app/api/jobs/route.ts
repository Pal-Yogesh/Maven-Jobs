import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]/options';
import prisma from '@/lib/dbConnect';
import { z } from 'zod';

// Validation schema for job posting
const jobSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  company: z.string().min(1, 'Company name is required'),
  location: z.string().min(1, 'Location is required'),
  salary: z.string().optional(),
  type: z.string().min(1, 'Job type is required'),
  employmentType: z.string().optional(),
  workMode: z.string().optional(),
  experience: z.string().min(1, 'Experience level is required'),
  skills: z.string().min(1, 'Skills are required'),
});

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Unauthorized - Please log in' },
        { status: 401 }
      );
    }

    // Check if user is a recruiter
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true }
    });

    if (!user || user.role !== 'recruiter') {
      return NextResponse.json(
        { error: 'Access denied - Only recruiters can post jobs' },
        { status: 403 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    
    const validationResult = jobSchema.safeParse(body);
    
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          error: 'Validation failed', 
          details: validationResult.error.format() 
        },
        { status: 400 }
      );
    }

    const { title, description, company, location, salary, type, employmentType, workMode, experience, skills } = validationResult.data;

    // Create job in database
    const job = await prisma.job.create({
      data: {
        title,
        description,
        company,
        location,
        salary,
        type,
        employmentType,
        workMode,
        experience,
        skills,
        postedBy: session.user.id,
      },
    });

    return NextResponse.json(
      { 
        message: 'Job posted successfully', 
        job 
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('Error posting job:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // Get query parameters for filtering
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const location = searchParams.get('location') || '';

    const skip = (page - 1) * limit;

    // Build where clause for filtering
    const where: any = {};
    
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { company: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (location) {
      where.location = { contains: location, mode: 'insensitive' };
    }

    // Get jobs with pagination
    const [jobs, total] = await Promise.all([
      prisma.job.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              name: true,
              email: true,
            }
          }
        }
      }),
      prisma.job.count({ where })
    ]);

    return NextResponse.json({
      jobs,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      }
    });

  } catch (error) {
    console.error('Error fetching jobs:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
