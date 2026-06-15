import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { rateLimit, getClientIp } from '@/lib/rateLimit'

// Trim a value to a string and cap its length so a malicious payload can't
// store megabytes per field.
function str(value: unknown, max: number, fallback = 'Unknown'): string {
  if (typeof value !== 'string') return fallback
  const trimmed = value.trim()
  if (!trimmed) return fallback
  return trimmed.slice(0, max)
}

// Coerce to an integer clamped into a sane range.
function int(value: unknown, min: number, max: number): number {
  const n = Math.floor(Number(value))
  if (!Number.isFinite(n)) return min
  return Math.min(max, Math.max(min, n))
}

function float(value: unknown, min: number, max: number): number {
  const n = Number(value)
  if (!Number.isFinite(n)) return min
  return Math.min(max, Math.max(min, n))
}

const VALID_USAGE = new Set(['desktop', 'programming', 'gaming', 'server', 'other'])

export async function POST(request: Request) {
  try {
    // Throttle: 8 submissions per IP per 10 minutes.
    const ip = getClientIp(request)
    const limit = rateLimit(`submit:${ip}`, 8, 10 * 60 * 1000)
    if (!limit.ok) {
      return NextResponse.json(
        { error: 'Too many submissions. Please slow down and try again later.' },
        { status: 429, headers: { 'Retry-After': String(limit.retryAfter) } }
      )
    }

    const data = await request.json()
    const { system_info, token, is_virtual, usage_type } = data

    if (!system_info || typeof system_info !== 'object' || !system_info.distro_name) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    let userId: string | null = null
    let submissionToken: string = token ?? `anon_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`

    if (token) {
      // Token personal de usuario (empieza por usr_)
      if (token.startsWith('usr_')) {
        const user = await prisma.user.findUnique({
          where: { submissionToken: token },
          select: { id: true },
        })
        if (user) {
          userId = user.id
          submissionToken = token
        }
      } else {
        // Token anónimo: reusar userId si ya tenía uno
        const existing = await prisma.submission.findFirst({
          where: { token },
          select: { userId: true },
        })
        if (existing) {
          userId = existing.userId
          submissionToken = token
        }
      }
    }

    const usage = typeof usage_type === 'string' && VALID_USAGE.has(usage_type) ? usage_type : 'other'

    const submissionData = {
      token: submissionToken,
      userId,
      distroName: str(system_info.distro_name, 60),
      distroVersion: str(system_info.distro_version, 40),
      kernel: str(system_info.kernel, 60),
      desktopEnv: str(system_info.desktop_environment, 40),
      cpu: str(system_info.cpu, 120),
      cpuCores: int(system_info.cpu_cores, 0, 1024),
      cpuThreads: int(system_info.cpu_threads, 0, 4096),
      ram: float(system_info.ram_gb, 0, 8192),
      gpu: str(system_info.gpu, 120),
      isVirtual: Boolean(is_virtual),
      usageType: usage,
    }

    // Dedup: if the most recent submission for this token is identical, just
    // refresh its timestamp instead of creating a duplicate row (e.g. running
    // the script again without any system changes).
    const last = await prisma.submission.findFirst({
      where: { token: submissionToken },
      orderBy: { timestamp: 'desc' },
    })
    const isIdentical =
      last !== null &&
      last.distroName === submissionData.distroName &&
      last.distroVersion === submissionData.distroVersion &&
      last.kernel === submissionData.kernel &&
      last.desktopEnv === submissionData.desktopEnv &&
      last.cpu === submissionData.cpu &&
      last.cpuCores === submissionData.cpuCores &&
      last.cpuThreads === submissionData.cpuThreads &&
      last.ram === submissionData.ram &&
      last.gpu === submissionData.gpu &&
      last.isVirtual === submissionData.isVirtual &&
      last.usageType === submissionData.usageType

    if (isIdentical && last) {
      await prisma.submission.update({
        where: { id: last.id },
        data: { timestamp: new Date() },
      })
      return NextResponse.json({
        success: true,
        token: submissionToken,
        submission_id: last.id,
        linked_to_account: userId !== null,
        unchanged: true,
      })
    }

    const submission = await prisma.submission.create({ data: submissionData })

    return NextResponse.json({
      success: true,
      token: submissionToken,
      submission_id: submission.id,
      linked_to_account: userId !== null,
    })

  } catch (error) {
    console.error('Error creating submission:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET() {
  try {
    const totalSubmissions = await prisma.submission.count()
    const topDistros = await prisma.submission.groupBy({
      by: ['distroName'],
      _count: { distroName: true },
      orderBy: { _count: { distroName: 'desc' } },
      take: 5,
    })
    return NextResponse.json({ total_submissions: totalSubmissions, top_distros: topDistros })
  } catch (error) {
    console.error('Error fetching stats:', error)
    return NextResponse.json({ error: 'Error fetching stats' }, { status: 500 })
  }
}
