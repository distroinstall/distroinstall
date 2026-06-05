import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'

export async function POST(request: Request) {
  let token: unknown
  let password: unknown
  try {
    ;({ token, password } = await request.json())
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  if (typeof token !== 'string' || !token) {
    return NextResponse.json({ error: 'Invalid or missing token' }, { status: 400 })
  }
  if (typeof password !== 'string' || password.length < 6) {
    return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 })
  }

  const record = await prisma.passwordResetToken.findUnique({ where: { token } })
  if (!record || record.expires < new Date()) {
    // Clean up an expired token if present.
    if (record) await prisma.passwordResetToken.delete({ where: { token } }).catch(() => {})
    return NextResponse.json(
      { error: 'This reset link is invalid or has expired. Please request a new one.' },
      { status: 400 }
    )
  }

  const user = await prisma.user.findUnique({ where: { email: record.email } })
  if (!user) {
    await prisma.passwordResetToken.deleteMany({ where: { email: record.email } })
    return NextResponse.json({ error: 'Account no longer exists.' }, { status: 400 })
  }

  const hashed = await bcrypt.hash(password, 12)
  await prisma.user.update({
    where: { id: user.id },
    data: {
      password: hashed,
      // A successful reset also confirms control of the inbox.
      emailVerified: user.emailVerified ?? new Date(),
    },
  })

  // Burn all reset tokens for this email so the link can't be reused.
  await prisma.passwordResetToken.deleteMany({ where: { email: record.email } })

  return NextResponse.json({ success: true })
}
