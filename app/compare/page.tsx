import Link from 'next/link'
import { ArrowLeft, Users, Database, Cpu, HardDrive } from 'lucide-react'
import { prisma } from '@/lib/prisma'
import { CompareSelector } from '@/components/CompareSelector'

async function getAllDistroNames(): Promise<string[]> {
  const rows = await prisma.submission.groupBy({
    by: ['distroName'],
    _count: { distroName: true },
    orderBy: { _count: { distroName: 'desc' } },
  })
  return rows.map(r => r.distroName)
}

async function getDistroStats(name: string) {
  const [total, hardware, topDesktop, topUsage, topGpu, virtualStats] = await Promise.all([
    prisma.submission.count({ where: { distroName: name } }),
    prisma.submission.aggregate({
      where: { distroName: name },
      _avg: { ram: true, cpuCores: true, cpuThreads: true },
    }),
    prisma.submission.groupBy({
      by: ['desktopEnv'],
      where: { distroName: name },
      _count: { desktopEnv: true },
      orderBy: { _count: { desktopEnv: 'desc' } },
      take: 1,
    }),
    prisma.submission.groupBy({
      by: ['usageType'],
      where: { distroName: name },
      _count: { usageType: true },
      orderBy: { _count: { usageType: 'desc' } },
      take: 1,
    }),
    prisma.submission.groupBy({
      by: ['gpu'],
      where: { distroName: name, gpu: { not: 'Unknown' } },
      _count: { gpu: true },
      orderBy: { _count: { gpu: 'desc' } },
      take: 1,
    }),
    prisma.submission.groupBy({
      by: ['isVirtual'],
      where: { distroName: name },
      _count: { isVirtual: true },
    }),
  ])

  const physical = virtualStats.find(v => !v.isVirtual)?._count.isVirtual ?? 0
  const virtualCount = virtualStats.find(v => v.isVirtual)?._count.isVirtual ?? 0
  const virtualPct = total > 0 ? Math.round((virtualCount / total) * 100) : 0

  return {
    name,
    total,
    avgRam: hardware._avg.ram,
    avgCores: hardware._avg.cpuCores,
    avgThreads: hardware._avg.cpuThreads,
    topDesktop: topDesktop[0]?.desktopEnv ?? '—',
    topUsage: topUsage[0]?.usageType ?? '—',
    topGpu: topGpu[0]?.gpu ?? '—',
    physical,
    virtualPct,
  }
}

const usageLabels: Record<string, string> = {
  desktop: 'Desktop/Personal',
  programming: 'Programming',
  gaming: 'Gaming',
  server: 'Server',
  other: 'Other',
}

type StatRowProps = {
  label: string
  a: string | number | null | undefined
  b: string | number | null | undefined
  higherIsBetter?: boolean
  unit?: string
  format?: (v: number) => string
}

function StatRow({ label, a, b, higherIsBetter = true, unit = '', format }: StatRowProps) {
  const aNum = typeof a === 'number' ? a : null
  const bNum = typeof b === 'number' ? b : null
  const aWins = aNum !== null && bNum !== null && higherIsBetter ? aNum > bNum : aNum !== null && bNum !== null ? aNum < bNum : false
  const bWins = aNum !== null && bNum !== null && higherIsBetter ? bNum > aNum : aNum !== null && bNum !== null ? bNum < aNum : false

  const fmt = (v: typeof a) => {
    if (v === null || v === undefined) return '—'
    if (typeof v === 'number') return format ? format(v) : `${v.toFixed(1)}${unit}`
    return String(v)
  }

  return (
    <div className="grid grid-cols-3 items-center py-3 border-b border-white/5 last:border-0">
      <div className={`text-center text-lg font-bold font-mono ${aWins ? 'text-green-400' : 'text-white'}`}>
        {fmt(a)}
      </div>
      <div className="text-center text-gray-400 text-sm px-2">{label}</div>
      <div className={`text-center text-lg font-bold font-mono ${bWins ? 'text-green-400' : 'text-white'}`}>
        {fmt(b)}
      </div>
    </div>
  )
}

export default async function ComparePage({
  searchParams,
}: {
  searchParams: { a?: string; b?: string }
}) {
  const nameA = searchParams.a ? decodeURIComponent(searchParams.a) : null
  const nameB = searchParams.b ? decodeURIComponent(searchParams.b) : null
  const allDistros = await getAllDistroNames()

  const bothSelected = nameA && nameB && nameA !== nameB

  const [statsA, statsB] = bothSelected
    ? await Promise.all([getDistroStats(nameA), getDistroStats(nameB)])
    : [null, null]

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto px-4 py-12 max-w-4xl">

        <div className="mb-10">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-6"
          >
            <ArrowLeft size={18} />
            Back to all distros
          </Link>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-2">⚖️ Compare Distros</h1>
          <p className="text-gray-400 text-lg">Side-by-side hardware & usage stats from real Linux users</p>
        </div>

        {/* Selector */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 mb-8">
          <CompareSelector distros={allDistros} />
        </div>

        {/* Comparison results */}
        {bothSelected && statsA && statsB && (
          <>
            {/* Distro headers */}
            <div className="grid grid-cols-3 mb-4 px-2">
              <Link
                href={`/distro/${encodeURIComponent(statsA.name)}`}
                className="text-center text-2xl font-bold text-white hover:text-purple-300 transition-colors"
              >
                {statsA.name}
              </Link>
              <div />
              <Link
                href={`/distro/${encodeURIComponent(statsB.name)}`}
                className="text-center text-2xl font-bold text-white hover:text-purple-300 transition-colors"
              >
                {statsB.name}
              </Link>
            </div>

            {/* Stats card */}
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 mb-4">
              <h2 className="text-gray-400 text-sm uppercase tracking-widest mb-4 text-center">Community</h2>
              <StatRow label="Total submissions" a={statsA.total} b={statsB.total} />
              <StatRow label="Virtual machine %" a={statsA.virtualPct} b={statsB.virtualPct} higherIsBetter={false} unit="%" />
            </div>

            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 mb-4">
              <h2 className="text-gray-400 text-sm uppercase tracking-widest mb-4 text-center">Hardware (avg)</h2>
              <StatRow label="RAM" a={statsA.avgRam} b={statsB.avgRam} unit=" GB" />
              <StatRow label="CPU cores" a={statsA.avgCores} b={statsB.avgCores} />
              <StatRow label="CPU threads" a={statsA.avgThreads} b={statsB.avgThreads} />
            </div>

            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 mb-8">
              <h2 className="text-gray-400 text-sm uppercase tracking-widest mb-4 text-center">Most popular</h2>
              <div className="grid grid-cols-3 items-center py-3 border-b border-white/5">
                <p className="text-center text-white font-semibold">{statsA.topDesktop}</p>
                <p className="text-center text-gray-400 text-sm">Desktop env</p>
                <p className="text-center text-white font-semibold">{statsB.topDesktop}</p>
              </div>
              <div className="grid grid-cols-3 items-center py-3 border-b border-white/5">
                <p className="text-center text-white font-semibold">{usageLabels[statsA.topUsage] ?? statsA.topUsage}</p>
                <p className="text-center text-gray-400 text-sm">Usage type</p>
                <p className="text-center text-white font-semibold">{usageLabels[statsB.topUsage] ?? statsB.topUsage}</p>
              </div>
              <div className="grid grid-cols-3 items-center py-3">
                <p className="text-center text-white text-sm font-medium max-w-[140px] mx-auto leading-tight">
                  {statsA.topGpu.length > 30 ? statsA.topGpu.slice(0, 30) + '…' : statsA.topGpu}
                </p>
                <p className="text-center text-gray-400 text-sm">Top GPU</p>
                <p className="text-center text-white text-sm font-medium max-w-[140px] mx-auto leading-tight">
                  {statsB.topGpu.length > 30 ? statsB.topGpu.slice(0, 30) + '…' : statsB.topGpu}
                </p>
              </div>
            </div>

            <p className="text-center text-gray-500 text-sm">
              Green = winner for that metric
            </p>
          </>
        )}

        {/* Prompt to pick two different distros */}
        {nameA && nameB && nameA === nameB && (
          <p className="text-center text-yellow-400 py-8">Pick two different distros to compare.</p>
        )}

      </div>
    </main>
  )
}

export const dynamic = 'force-dynamic'
