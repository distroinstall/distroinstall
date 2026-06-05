import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { Prisma } from '@prisma/client'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

const USERNAME_RE = /^[a-zA-Z0-9_-]{3,20}$/

export async function PATCH(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const { name, username } = (body ?? {}) as { name?: unknown; username?: unknown }
  const data: Prisma.UserUpdateInput = {}

  if (name !== undefined) {
    if (typeof name !== 'string') {
      return NextResponse.json({ error: 'Name must be text' }, { status: 400 })
    }
    const trimmed = name.trim()
    if (trimmed.length < 1 || trimmed.length > 40) {
      return NextResponse.json({ error: 'Name must be between 1 and 40 characters' }, { status: 400 })
    }
    data.name = trimmed
  }

  if (username !== undefined) {
    if (typeof username !== 'string') {
      return NextResponse.json({ error: 'Username must be text' }, { status: 400 })
    }
    const trimmed = username.trim()
    if (trimmed === '') {
      data.username = null // allow clearing
    } else if (!USERNAME_RE.test(trimmed)) {
      return NextResponse.json(
        { error: 'Username must be 3–20 characters: letters, numbers, hyphen or underscore' },
        { status: 400 }
      )
    } else {
      data.username = trimmed
    }
  }

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: 'Nothing to update' }, { status: 400 })
  }

  try {
    const updated = await prisma.user.update({
      where: { id: session.user.id },
      data,
      select: { name: true, username: true },
    })
    return NextResponse.json({ success: true, user: updated })
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return NextResponse.json({ error: 'That username is already taken' }, { status: 409 })
    }
    console.error('Error updating account:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
