// app/api/submit/route.ts
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: Request) {
  try {
    const data = await request.json()
    const { system_info, token, is_virtual, usage_type } = data

    // Validación básica
    if (!system_info || !system_info.distro_name) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    let userId = null
    let submissionToken = token

    // Si hay token, verificar si existe
    if (token) {
      const existingSubmission = await prisma.submission.findFirst({
        where: { token },
        include: { user: true }
      })
      
      if (existingSubmission) {
        // Token existe, usar su userId si tiene
        userId = existingSubmission.userId
        submissionToken = token // Reutilizar el mismo token
      } else {
        // Token no existe, crear uno nuevo
        submissionToken = `anon_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      }
    } else {
      // Sin token, generar uno nuevo
      submissionToken = `anon_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    }

    // Crear nueva submission
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
      }
    })

    return NextResponse.json({
      success: true,
      token: submissionToken,
      submission_id: submission.id,
      message: token ? 'Linked to existing token' : 'New token created'
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
      take: 5
    })

    return NextResponse.json({
      total_submissions: totalSubmissions,
      top_distros: topDistros
    })
  } catch (error) {
    console.error('Error fetching stats:', error)
    return NextResponse.json({ error: 'Error fetching stats' }, { status: 500 })
  }
}