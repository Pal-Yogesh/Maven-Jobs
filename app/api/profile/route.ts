import prisma from '@/lib/dbConnect';
import { NextResponse } from 'next/server';
import { ApiResponse } from '@/types/ApiResponse';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json<ApiResponse>({
        success: false,
        message: 'User ID is required'
      }, { status: 400 });
    }

    // Fetch user profile with all related data
    const profile = await prisma.profile.findUnique({
      where: { userId },
      include: {
        user: {
          select: {
            name: true,
            email: true,
            role: true
          }
        }
      }
    });

    const skills = await prisma.skill.findMany({
      where: { userId }
    });

    const employments = await prisma.employment.findMany({
      where: { userId }
    });

    const educations = await prisma.education.findMany({
      where: { userId }
    });

    const projects = await prisma.project.findMany({
      where: { userId }
    });

    const certifications = await prisma.certification.findMany({
      where: { userId }
    });

    return NextResponse.json({
      success: true,
      data: {
        profile,
        skills,
        employments,
        educations,
        projects,
        certifications
      }
    }, { status: 200 });

  } catch (error) {
    console.error('Error fetching profile:', error);
    return NextResponse.json<ApiResponse>({
      success: false,
      message: 'Error fetching profile data'
    }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const {
      userId,
      profileData,
      skills,
      employments,
      educations,
      projects,
      certifications
    } = await request.json();

    console.log(userId, profileData, skills, employments, educations, projects, certifications);

    if (!userId) {
      return NextResponse.json<ApiResponse>({
        success: false,
        message: 'User ID is required'
      }, { status: 400 });
    }

    // Start a transaction to ensure all operations succeed or fail together
    const result = await prisma.$transaction(async (tx) => {
      // Upsert profile data
      const profile = await tx.profile.upsert({
        where: { userId },
        update: profileData,
        create: {
          userId,
          ...profileData
        }
      });

      // Handle skills - delete existing and create new ones
      if (skills) {
        await tx.skill.deleteMany({ where: { userId } });
        if (skills.length > 0) {
          await tx.skill.createMany({
            data: skills.map((skill: { name: string }) => ({
              userId,
              name: skill.name
            }))
          });
        }
      }

      // Handle employments
      if (employments) {
        await tx.employment.deleteMany({ where: { userId } });
        if (employments.length > 0) {
          await tx.employment.createMany({
            data: employments.map((emp: any) => ({
              userId,
              company: emp.company,
              designation: emp.designation,
              from: emp.from,
              to: emp.to,
              current: emp.current || false,
              description: emp.description
            }))
          });
        }
      }

      // Handle educations
      if (educations) {
        await tx.education.deleteMany({ where: { userId } });
        if (educations.length > 0) {
          await tx.education.createMany({
            data: educations.map((edu: any) => ({
              userId,
              degree: edu.degree,
              institute: edu.institute,
              year: edu.year
            }))
          });
        }
      }

      // Handle projects
      if (projects) {
        await tx.project.deleteMany({ where: { userId } });
        if (projects.length > 0) {
          await tx.project.createMany({
            data: projects.map((proj: any) => ({
              userId,
              name: proj.name,
              role: proj.role,
              from: proj.from,
              to: proj.to,
              description: proj.description
            }))
          });
        }
      }

      // Handle certifications
      if (certifications) {
        await tx.certification.deleteMany({ where: { userId } });
        if (certifications.length > 0) {
          await tx.certification.createMany({
            data: certifications.map((cert: any) => ({
              userId,
              name: cert.name,
              authority: cert.authority,
              year: cert.year
            }))
          });
        }
      }

      return { profile };
    });

    return NextResponse.json({
      success: true,
      message: 'Profile saved successfully',
      data: result
    }, { status: 200 });

  } catch (error) {
    console.error('Error saving profile:', error);
    return NextResponse.json<ApiResponse>({
      success: false,
      message: 'Error saving profile data'
    }, { status: 500 });
  }
}
