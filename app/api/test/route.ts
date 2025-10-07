// app/api/test/route.ts
import prisma from '@/lib/dbConnect';
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    // Test connection
    await prisma.$queryRaw`SELECT 1`
    return NextResponse.json({ status: 'Prisma connected successfully' })
  } catch (error) {
    return NextResponse.json({ error: 'Prisma connection failed' }, { status: 500 })
  }
}