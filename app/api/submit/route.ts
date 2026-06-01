import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: Request) {
  try {
    const data = await request.json()
    const { system_info, token, is_virtual, usage_type } = data

    if (!system_info || !system_info.distro_name) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    let userId: string | null = null
    let submissionToken: string = token ?? `anon_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

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

    const submission = await prisma.submission.create({
      data: {
        token: submissionToken,
        userId,
        distroName: system_info.distro_name,
        distroVersion: system_info.distro_version || 'Unknown',
        kernel: system_info.kernel,
        desktopEnv: system_info.desktop_environment || 'Unknown',
        cpu: system_info.cpu || 'Unknown',
        cpuCores: system_info.cpu_cores || 0,
        cpuThreads: system_info.cpu_threads || 0,
        ram: system_info.ram_gb || 0,
        gpu: system_info.gpu || 'Unknown',
        isVirtual: is_virtual || false,
        usageType: usage_type || 'other',
      },
    })

    return NextResponse.json({
      success: true,
      token: submissionToken,
      submission_id: submission.id,
      linked_to_account: userId !== null,
    })

  } catch (error) {
    console.error('Error creating submission:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
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
