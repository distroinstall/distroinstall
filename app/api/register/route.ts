import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { sendVerificationEmail } from '@/lib/email'
import { randomBytes } from 'crypto'

export async function POST(request: Request) {
  const { name, email, password } = await request.json()

  if (!email || !password) {
    return NextResponse.json({ error: 'Email and password are required' }, { status: 400 })
  }
  if (password.length < 6) {
    return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 })
  }

  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) {
    return NextResponse.json({ error: 'This email is already registered' }, { status: 409 })
  }

  const hashed = await bcrypt.hash(password, 12)
  const user = await prisma.user.create({
    data: { name: name || null, email, password: hashed },
  })

  // Generar token de verificación (24h)
  const token = randomBytes(32).toString('hex')
  const expires = new Date(Date.now() + 24 * 60 * 60 * 1000)
  await prisma.verificationToken.create({
    data: { identifier: email, token, expires },
  })

  try {
    await sendVerificationEmail(email, token)
  } catch (error) {
    console.error('Verification email failed, rolling back registration:', error)
    // Roll back so the user can try again instead of being stuck as "already registered".
    await prisma.verificationToken.deleteMany({ where: { identifier: email } })
    await prisma.user.delete({ where: { id: user.id } })
    return NextResponse.json(
      { error: 'We could not send the verification email. Please try again in a moment.' },
      { status: 502 }
    )
  }

  return NextResponse.json({ success: true, message: 'Check your email to verify your account.' })
}
