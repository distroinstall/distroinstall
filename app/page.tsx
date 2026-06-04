import Link from 'next/link'
import { Prisma } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { Download, TrendingUp, Users, HardDrive } from 'lucide-react'
import { HorizontalBarChart, DesktopPieChart, UsagePieChart } from '@/components/Charts'
import { FilterBar } from '@/components/FilterBar'

type GpuByDistro = { distroName: string; gpu: string }

type Filters = {
  isVirtual?: boolean
  usageType?: string
}

async function getStats(filters: Filters = {}) {
  const where: Prisma.SubmissionWhereInput = {}
  if (filters.isVirtual !== undefined) where.isVirtual = filters.isVirtual
  if (filters.usageType) where.usageType = filters.usageType

  const virtualFilter = filters.isVirtual !== undefined
    ? Prisma.sql`AND "isVirtual" = ${filters.isVirtual}`
    : Prisma.sql``
  const usageFilter = filters.usageType
    ? Prisma.sql`AND "usageType" = ${filters.usageType}`
    : Prisma.sql``

  const [
    totalSubmissions,
    distroStats,
    topDesktops,
    usageStats,
    virtualVsPhysical,
    recentSubmissions,
    topGpuPerDistro,
  ] = await Promise.all([
    prisma.submission.count({ where }),
    prisma.submission.groupBy({
      by: ['distroName'],
      where,
      _count: { distroName: true },
      _avg: { ram: true, cpuCores: true, cpuThreads: true },
      orderBy: { _count: { distroName: 'desc' } },
    }),
    prisma.submission.groupBy({
      by: ['desktopEnv'],
      where,
      _count: { desktopEnv: true },
      orderBy: { _count: { desktopEnv: 'desc' } },
      take: 6,
    }),
    prisma.submission.groupBy({
      by: ['usageType'],
      where,
      _count: { usageType: true },
      orderBy: { _count: { usageType: 'desc' } },
    }),
    prisma.submission.groupBy({
      by: ['isVirtual'],
      where,
      _count: { isVirtual: true },
    }),
    prisma.submission.findMany({
      where,
      take: 5,
      orderBy: { timestamp: 'desc' },
      select: {
        distroName: true,
        distroVersion: true,
        kernel: true,
        desktopEnv: true,
        timestamp: true,
        isVirtual: true,
        usageType: true,
      },
    }),
    prisma.$queryRaw<GpuByDistro[]>`
      SELECT DISTINCT ON ("distroName") "distroName", "gpu"
      FROM (
        SELECT "distroName", "gpu", COUNT(*) as cnt
        FROM "Submission"
        WHERE "gpu" != 'Unknown' ${virtualFilter} ${usageFilter}
        GROUP BY "distroName", "gpu"
      ) t
      ORDER BY "distroName", cnt DESC
    `,
  ])

  const gpuMap = new Map(topGpuPerDistro.map(r => [r.distroName, r.gpu]))

  return {
    totalSubmissions,
    uniqueDistrosCount: distroStats.length,
    topDistros: distroStats.slice(0, 10),
    topDesktops,
    usageStats,
    virtualVsPhysical,
    recentSubmissions,
    perDistroHardware: distroStats.slice(0, 20).map(s => ({
      distroName: s.distroName,
      count: s._count.distroName,
      avgRam: s._avg.ram,
      avgCpuCores: s._avg.cpuCores,
      avgCpuThreads: s._avg.cpuThreads,
      topGpu: gpuMap.get(s.distroName) ?? 'N/A',
    })),
  }
}

export default async function Home({
  searchParams,
}: {
  searchParams: { virtual?: string; usage?: string }
}) {
  const filters: Filters = {}
  if (searchParams.virtual === 'true') filters.isVirtual = true
  if (searchParams.virtual === 'false') filters.isVirtual = false
  if (searchParams.usage) filters.usageType = searchParams.usage

  const stats = await getStats(filters)
  const isFiltered = Object.keys(filters).length > 0

  const usageLabels: Record<string, string> = {
    desktop: 'Desktop/Personal',
    programming: 'Programming',
    gaming: 'Gaming',
    server: 'Server',
    other: 'Other',
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto px-4 py-16">

        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-7xl font-bold text-white mb-4">🐧 DistroInstall</h1>
          <p className="text-2xl text-gray-300 mb-8">Real stats from real Linux users</p>
          <div className="max-w-3xl mx-auto bg-slate-800/50 backdrop-blur-lg rounded-xl p-6 border border-white/10">
            <div className="flex items-center gap-3 mb-3">
              <Download className="text-green-400" size={24} />
              <span className="text-white font-semibold">Submit your system:</span>
            </div>
            <code className="block bg-black/50 p-4 rounded-lg text-green-400 text-sm overflow-x-auto">
              curl -sSL https://distroinstall.vercel.app/install.sh | bash
            </code>
            <p className="text-gray-400 text-sm mt-3">
              Or download: <a href="/distroinstall.py" className="text-blue-400 hover:underline">distroinstall.py</a>
            </p>
          </div>
        </div>

        {/* Filters */}
        <FilterBar />

        {/* Stats row */}
        <div className="grid md:grid-cols-4 gap-6 mb-12">
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
            <div className="flex items-center gap-3">
              <Users className="text-blue-400" size={32} />
              <div>
                <p className="text-gray-300 text-sm">{isFiltered ? 'Filtered results' : 'Total Submissions'}</p>
                <p className="text-4xl font-bold text-white">{stats.totalSubmissions}</p>
              </div>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
            <div className="flex items-center gap-3">
              <TrendingUp className="text-green-400" size={32} />
              <div>
                <p className="text-gray-300 text-sm">Unique Distros</p>
                <p className="text-4xl font-bold text-white">{stats.uniqueDistrosCount}</p>
              </div>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
            <div className="flex items-center gap-3">
              <HardDrive className="text-purple-400" size={32} />
              <div>
                <p className="text-gray-300 text-sm">Physical Machines</p>
                <p className="text-4xl font-bold text-white">
                  {stats.virtualVsPhysical.find(v => !v.isVirtual)?._count.isVirtual ?? 0}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
            <div className="flex items-center gap-3">
              <div className="text-3xl">💻</div>
              <div>
                <p className="text-gray-300 text-sm">Virtual Machines</p>
                <p className="text-4xl font-bold text-white">
                  {stats.virtualVsPhysical.find(v => v.isVirtual)?._count.isVirtual ?? 0}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Charts grid */}
        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
            <h2 className="text-3xl font-bold text-white mb-6">🏆 Top Distributions</h2>
            {stats.totalSubmissions > 0
              ? <HorizontalBarChart data={stats.topDistros.map(d => ({ label: d.distroName, count: d._count.distroName }))} />
              : <p className="text-gray-400 text-center py-16">No data for this filter</p>}
          </div>

          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
            <h2 className="text-3xl font-bold text-white mb-6">🎨 Desktop Environments</h2>
            {stats.totalSubmissions > 0
              ? <DesktopPieChart data={stats.topDesktops} />
              : <p className="text-gray-400 text-center py-16">No data for this filter</p>}
          </div>

          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
            <h2 className="text-3xl font-bold text-white mb-6">🎯 Usage Types</h2>
            {stats.totalSubmissions > 0
              ? <UsagePieChart data={stats.usageStats} labels={usageLabels} />
              : <p className="text-gray-400 text-center py-16">No data for this filter</p>}
          </div>

          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
            <h2 className="text-3xl font-bold text-white mb-6">⚡ Recent Submissions</h2>
            <div className="space-y-4">
              {stats.recentSubmissions.map((sub, index) => (
                <div
                  key={index}
                  className="bg-white/5 rounded-lg p-4 border border-white/10 hover:border-white/30 transition-colors"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="text-white font-bold text-lg">
                        {sub.distroName} {sub.distroVersion}
                      </p>
                      <p className="text-gray-400 text-sm">
                        {sub.desktopEnv} • Kernel {sub.kernel}
                      </p>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded ${
                      sub.isVirtual
                        ? 'bg-purple-500/20 text-purple-300'
                        : 'bg-blue-500/20 text-blue-300'
                    }`}>
                      {sub.isVirtual ? 'Virtual' : 'Physical'}
                    </span>
                  </div>
                  <p className="text-gray-500 text-xs">
                    {new Date(sub.timestamp).toLocaleString()}
                  </p>
                </div>
              ))}
              {stats.recentSubmissions.length === 0 && (
                <p className="text-gray-400 text-center py-16">No submissions for this filter</p>
              )}
            </div>
          </div>
        </div>

        {/* Hardware by distribution table */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 mb-8">
          <h2 className="text-3xl font-bold text-white mb-6">🔧 Hardware by Distribution</h2>
          {stats.perDistroHardware.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-gray-400 text-sm text-left border-b border-white/10">
                    <th className="pb-3 pr-4 font-medium">Distribution</th>
                    <th className="pb-3 pr-4 font-medium text-right">Submissions</th>
                    <th className="pb-3 pr-4 font-medium text-right">Avg RAM</th>
                    <th className="pb-3 pr-4 font-medium text-right">Avg CPU</th>
                    <th className="pb-3 font-medium">Top GPU</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {stats.perDistroHardware.map(row => (
                    <tr key={row.distroName} className="hover:bg-white/5 transition-colors">
                      <td className="py-3 pr-4">
                        <Link
                          href={`/distro/${encodeURIComponent(row.distroName)}`}
                          className="text-white font-semibold hover:text-blue-400 transition-colors"
                        >
                          {row.distroName}
                        </Link>
                      </td>
                      <td className="py-3 pr-4 text-gray-300 text-right">{row.count}</td>
                      <td className="py-3 pr-4 text-cyan-300 text-right font-mono">
                        {row.avgRam != null ? `${row.avgRam.toFixed(1)} GB` : '—'}
                      </td>
                      <td className="py-3 pr-4 text-right font-mono text-sm whitespace-nowrap">
                        <span className="text-orange-300">{row.avgCpuCores != null ? row.avgCpuCores.toFixed(1) : '—'}c</span>
                        <span className="text-gray-500"> / </span>
                        <span className="text-yellow-300">{row.avgCpuThreads != null ? row.avgCpuThreads.toFixed(1) : '—'}t</span>
                      </td>
                      <td className="py-3 text-gray-300 text-sm max-w-xs">
                        <span title={row.topGpu} className="block truncate">{row.topGpu}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-400 text-center py-8">No data for this filter</p>
          )}
        </div>

        {/* Footer CTA */}
        <div className="text-center">
          <div className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 backdrop-blur-lg rounded-2xl p-12 border border-white/20">
            <h2 className="text-4xl font-bold text-white mb-4">Join the Community</h2>
            <p className="text-xl text-gray-300 mb-8">
              Submit your Linux setup and see how it compares
            </p>
            <code className="inline-block cursor-copy bg-black/50 px-6 py-3 rounded-lg text-green-400 text-lg">
              python3 distroinstall.py
            </code>
          </div>
        </div>

      </div>
    </main>
  )
}

export const dynamic = 'force-dynamic'
