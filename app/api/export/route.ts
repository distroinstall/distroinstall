import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const [user, submissions, badges] = await Promise.all([
    prisma.user.findUnique({
      where: { id: session.user.id },
      select: { id: true, email: true, name: true, createdAt: true, submissionToken: true },
    }),
    prisma.submission.findMany({
      where: { userId: session.user.id },
      orderBy: { timestamp: 'desc' },
    }),
    prisma.badge.findMany({
      where: { userId: session.user.id },
      select: { badgeType: true, earnedAt: true },
    }),
  ])

  const payload = {
    exported_at: new Date().toISOString(),
    user,
    submissions,
    badges,
  }

  return new NextResponse(JSON.stringify(payload, null, 2), {
    headers: {
      'Content-Type': 'application/json',
      'Content-Disposition': 'attachment; filename="distroinstall-data.json"',
    },
  })
}
