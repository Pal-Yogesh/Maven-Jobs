import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import { uploadToR2, generateResumeFileName } from '@/lib/r2';
import prisma from '@/lib/dbConnect';

export async function POST(request: Request) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    console.log('session', session);

    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const userId = session.user.id;

    // Parse the multipart form data
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { success: false, message: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Invalid file type. Only PDF, DOC, and DOCX are allowed.' 
        },
        { status: 400 }
      );
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'File size too large. Maximum size is 5MB.' 
        },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Generate unique filename
    const fileName = generateResumeFileName(file.name, userId);

    // Upload to R2
    const resumeUrl = await uploadToR2(buffer, fileName, file.type);
    console.log('resumeUrl', resumeUrl);

    // Update user profile with the resume URL
    await prisma.profile.upsert({
      where: { userId },
      update: { resumeUrl },
      create: {
        userId,
        resumeUrl,
      },
    });
    
    return NextResponse.json(
      {
        success: true,
        message: 'Resume uploaded successfully',
        data: { resumeUrl },
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Error uploading resume:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to upload resume. Please try again.',
      },
      { status: 500 }
    );
  }
}

