import { NextResponse } from 'next/server'
import { randomBytes } from 'crypto'
import { prisma } from '@/lib/prisma'
import { sendPasswordResetEmail } from '@/lib/email'
import { rateLimit, getClientIp } from '@/lib/rateLimit'

// Generic response used in every case so the endpoint can't be used to probe
// which emails are registered.
const GENERIC = NextResponse.json({
  success: true,
  message: 'If an account exists for that email, a reset link is on its way.',
})

export async function POST(request: Request) {
  // Throttle: 5 requests per IP per 15 minutes.
  const ip = getClientIp(request)
  const limit = rateLimit(`forgot:${ip}`, 5, 15 * 60 * 1000)
  if (!limit.ok) {
    return NextResponse.json(
      { error: 'Too many requests. Please try again later.' },
      { status: 429, headers: { 'Retry-After': String(limit.retryAfter) } }
    )
  }

  let email: unknown
  try {
    ;({ email } = await request.json())
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  if (typeof email !== 'string' || !email.includes('@')) {
    return NextResponse.json({ error: 'A valid email is required' }, { status: 400 })
  }

  // Match how registration/login store the address (trim only, no case change).
  const normalized = email.trim()
  const user = await prisma.user.findUnique({ where: { email: normalized } })

  // Only send a link to accounts that actually use a password (not OAuth-only).
  if (user?.password) {
    const token = randomBytes(32).toString('hex')
    const expires = new Date(Date.now() + 60 * 60 * 1000) // 1 hour

    // Invalidate any previous reset tokens for this email.
    await prisma.passwordResetToken.deleteMany({ where: { email: normalized } })
    await prisma.passwordResetToken.create({ data: { email: normalized, token, expires } })

    try {
      await sendPasswordResetEmail(normalized, token)
    } catch (error) {
      console.error('Password reset email failed:', error)
      return NextResponse.json(
        { error: 'We could not send the reset email. Please try again in a moment.' },
        { status: 502 }
      )
    }
  }

  return GENERIC
}
