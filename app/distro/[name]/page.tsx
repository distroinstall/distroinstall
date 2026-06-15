import Link from 'next/link'
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { ArrowLeft, Users, HardDrive, Cpu, Database, ExternalLink } from 'lucide-react'
import { HorizontalBarChart, DesktopPieChart, UsagePieChart } from '@/components/Charts'
import { getDistroMeta } from '@/lib/distros'

const usageLabels: Record<string, string> = {
  desktop: 'Desktop/Personal',
  programming: 'Programming',
  gaming: 'Gaming',
  server: 'Server',
  other: 'Other',
}

async function getDistroStats(name: string) {
  const [
    totalSubmissions,
    versionStats,
    desktopStats,
    usageStats,
    virtualVsPhysical,
    hardwareStats,
    gpuStats,
    kernelStats,
    recentSubmissions,
  ] = await Promise.all([
    prisma.submission.count({ where: { distroName: name } }),
    prisma.submission.groupBy({
      by: ['distroVersion'],
      where: { distroName: name },
      _count: { distroVersion: true },
      orderBy: { _count: { distroVersion: 'desc' } },
      take: 10,
    }),
    prisma.submission.groupBy({
      by: ['desktopEnv'],
      where: { distroName: name },
      _count: { desktopEnv: true },
      orderBy: { _count: { desktopEnv: 'desc' } },
      take: 6,
    }),
    prisma.submission.groupBy({
      by: ['usageType'],
      where: { distroName: name },
      _count: { usageType: true },
      orderBy: { _count: { usageType: 'desc' } },
    }),
    prisma.submission.groupBy({
      by: ['isVirtual'],
      where: { distroName: name },
      _count: { isVirtual: true },
    }),
    prisma.submission.aggregate({
      where: { distroName: name },
      _avg: { ram: true, cpuCores: true, cpuThreads: true },
      _min: { ram: true },
      _max: { ram: true },
    }),
    prisma.submission.groupBy({
      by: ['gpu'],
      where: { distroName: name, gpu: { not: 'Unknown' } },
      _count: { gpu: true },
      orderBy: { _count: { gpu: 'desc' } },
      take: 6,
    }),
    prisma.submission.groupBy({
      by: ['kernel'],
      where: { distroName: name },
      _count: { kernel: true },
      orderBy: { _count: { kernel: 'desc' } },
      take: 6,
    }),
    prisma.submission.findMany({
      where: { distroName: name },
      take: 10,
      orderBy: { timestamp: 'desc' },
      select: {
        distroVersion: true,
        kernel: true,
        desktopEnv: true,
        cpu: true,
        cpuCores: true,
        cpuThreads: true,
        ram: true,
        gpu: true,
        isVirtual: true,
        usageType: true,
        timestamp: true,
      },
    }),
  ])

  if (totalSubmissions === 0) return null

  return {
    totalSubmissions,
    versionStats,
    desktopStats,
    usageStats,
    virtualVsPhysical,
    avgRam: hardwareStats._avg.ram,
    avgCpuCores: hardwareStats._avg.cpuCores,
    avgCpuThreads: hardwareStats._avg.cpuThreads,
    minRam: hardwareStats._min.ram,
    maxRam: hardwareStats._max.ram,
    gpuStats,
    kernelStats,
    recentSubmissions,
  }
}

export default async function DistroPage({ params }: { params: { name: string } }) {
  const distroName = decodeURIComponent(params.name)
  const stats = await getDistroStats(distroName)

  if (!stats) notFound()

  const physical = stats.virtualVsPhysical.find(v => !v.isVirtual)?._count.isVirtual ?? 0
  const virtual_ = stats.virtualVsPhysical.find(v => v.isVirtual)?._count.isVirtual ?? 0
  const meta = getDistroMeta(distroName)

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto px-4 py-12">

        {/* Back + header */}
        <div className="mb-10">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-6"
          >
            <ArrowLeft size={18} />
            Back to all distros
          </Link>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-2 break-words">{distroName}</h1>
          <p className="text-xl text-gray-400">
            {stats.totalSubmissions} submission{stats.totalSubmissions !== 1 ? 's' : ''} from the community
          </p>
        </div>

        {/* About this distro */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 mb-10">
          <div className="flex items-start justify-between gap-4 flex-wrap mb-3">
            <h2 className="text-2xl font-bold text-white">About {distroName}</h2>
            {meta?.basedOn && (
              <span className="text-xs px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 border border-purple-400/30">
                Based on {meta.basedOn}
              </span>
            )}
          </div>
          <p className="text-gray-300 leading-relaxed mb-5">
            {meta
              ? meta.description
              : `${distroName} is a community-submitted Linux distribution. We don't have a curated description for it yet.`}
          </p>
          <a
            href={meta ? meta.url : `https://duckduckgo.com/?q=${encodeURIComponent(distroName + ' linux distribution')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-sm font-medium rounded-lg border border-white/20 transition-colors"
          >
            <ExternalLink size={15} />
            {meta ? 'Visit official website' : `Search for ${distroName}`}
          </a>
        </div>

        {/* Summary cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-10">
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
            <div className="flex items-center gap-3">
              <Users className="text-blue-400" size={28} />
              <div>
                <p className="text-gray-300 text-sm">Total Submissions</p>
                <p className="text-3xl font-bold text-white">{stats.totalSubmissions}</p>
              </div>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
            <div className="flex items-center gap-3">
              <Database className="text-cyan-400" size={28} />
              <div>
                <p className="text-gray-300 text-sm">Avg RAM</p>
                <p className="text-3xl font-bold text-white">
                  {stats.avgRam != null ? `${stats.avgRam.toFixed(1)} GB` : '—'}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
            <div className="flex items-center gap-3">
              <Cpu className="text-orange-400" size={28} />
              <div>
                <p className="text-gray-300 text-sm">Avg CPU</p>
                <p className="text-2xl font-bold text-white whitespace-nowrap">
                  <span className="text-orange-300">{stats.avgCpuCores != null ? stats.avgCpuCores.toFixed(1) : '—'}c</span>
                  <span className="text-gray-500"> / </span>
                  <span className="text-yellow-300">{stats.avgCpuThreads != null ? stats.avgCpuThreads.toFixed(1) : '—'}t</span>
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
            <div className="flex items-center gap-3">
              <HardDrive className="text-purple-400" size={28} />
              <div>
                <p className="text-gray-300 text-sm">Physical / Virtual</p>
                <p className="text-3xl font-bold text-white">{physical} / {virtual_}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Charts grid */}
        <div className="grid lg:grid-cols-2 gap-8 mb-8">

          {/* Versions */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
            <h2 className="text-2xl font-bold text-white mb-6">📦 Versions</h2>
            {stats.versionStats.length > 0
              ? <HorizontalBarChart
                  data={stats.versionStats.map(v => ({ label: v.distroVersion, count: v._count.distroVersion }))}
                />
              : <p className="text-gray-400 text-center py-8">No data</p>}
          </div>

          {/* Desktop environments */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
            <h2 className="text-2xl font-bold text-white mb-6">🎨 Desktop Environments</h2>
            {stats.desktopStats.length > 0
              ? <DesktopPieChart data={stats.desktopStats} />
              : <p className="text-gray-400 text-center py-8">No data</p>}
          </div>

          {/* Usage types */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
            <h2 className="text-2xl font-bold text-white mb-6">🎯 Usage Types</h2>
            {stats.usageStats.length > 0
              ? <UsagePieChart data={stats.usageStats} labels={usageLabels} />
              : <p className="text-gray-400 text-center py-8">No data</p>}
          </div>

          {/* GPU distribution */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
            <h2 className="text-2xl font-bold text-white mb-6">🎮 GPUs</h2>
            {stats.gpuStats.length > 0
              ? <HorizontalBarChart
                  yAxisWidth={160}
                  data={stats.gpuStats.map(g => ({
                    label: g.gpu.length > 28 ? g.gpu.slice(0, 28) + '…' : g.gpu,
                    count: g._count.gpu,
                  }))}
                />
              : <p className="text-gray-400 text-center py-8">No data</p>}
          </div>

        </div>

        {/* Kernels */}
        {stats.kernelStats.length > 1 && (
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 mb-8">
            <h2 className="text-2xl font-bold text-white mb-6">🐧 Kernel Versions</h2>
            <HorizontalBarChart
              yAxisWidth={160}
              data={stats.kernelStats.map(k => ({ label: k.kernel, count: k._count.kernel }))}
            />
          </div>
        )}

        {/* Recent submissions */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
          <h2 className="text-2xl font-bold text-white mb-6">⚡ Recent Submissions</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-gray-400 text-sm text-left border-b border-white/10">
                  <th className="pb-3 pr-4 font-medium">Version</th>
                  <th className="pb-3 pr-4 font-medium">Desktop</th>
                  <th className="pb-3 pr-4 font-medium">CPU</th>
                  <th className="pb-3 pr-4 font-medium text-right">RAM</th>
                  <th className="pb-3 pr-4 font-medium">GPU</th>
                  <th className="pb-3 pr-4 font-medium">Type</th>
                  <th className="pb-3 pr-4 font-medium">Usage</th>
                  <th className="pb-3 font-medium">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {stats.recentSubmissions.map((sub, i) => (
                  <tr key={i} className="hover:bg-white/5 transition-colors">
                    <td className="py-3 pr-4 text-white font-medium">{sub.distroVersion}</td>
                    <td className="py-3 pr-4 text-gray-300">{sub.desktopEnv}</td>
                    <td className="py-3 pr-4 text-sm max-w-[180px]">
                      <span title={sub.cpu} className="block truncate text-gray-300">{sub.cpu}</span>
                      <span className="font-mono text-xs whitespace-nowrap">
                        <span className="text-orange-300">{sub.cpuCores}c</span>
                        <span className="text-gray-500"> / </span>
                        <span className="text-yellow-300">{sub.cpuThreads}t</span>
                      </span>
                    </td>
                    <td className="py-3 pr-4 text-cyan-300 text-right font-mono whitespace-nowrap">{sub.ram} GB</td>
                    <td className="py-3 pr-4 text-gray-300 text-sm max-w-[160px]">
                      <span title={sub.gpu} className="block truncate">{sub.gpu}</span>
                    </td>
                    <td className="py-3 pr-4">
                      <span className={`text-xs px-2 py-1 rounded ${
                        sub.isVirtual
                          ? 'bg-purple-500/20 text-purple-300'
                          : 'bg-blue-500/20 text-blue-300'
                      }`}>
                        {sub.isVirtual ? 'Virtual' : 'Physical'}
                      </span>
                    </td>
                    <td className="py-3 pr-4 text-gray-300 text-sm">{usageLabels[sub.usageType] ?? sub.usageType}</td>
                    <td className="py-3 text-gray-500 text-xs whitespace-nowrap">
                      {new Date(sub.timestamp).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </main>
  )
}

export const dynamic = 'force-dynamic'
