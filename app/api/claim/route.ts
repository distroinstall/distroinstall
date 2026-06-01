import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { token } = await request.json()
  if (!token) {
    return NextResponse.json({ error: 'Token required' }, { status: 400 })
  }

  const { count } = await prisma.submission.updateMany({
    where: { token, userId: null },
    data: { userId: session.user.id },
  })

  if (count === 0) {
    return NextResponse.json(
      { error: 'No anonymous submissions found for this token' },
      { status: 404 }
    )
  }

  return NextResponse.json({ success: true, claimed: count })
}
