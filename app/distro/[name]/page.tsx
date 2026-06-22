import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { Users, HardDrive, Cpu, Database, ExternalLink, Package, Palette, Target, Monitor, Layers, Activity, HelpCircle, ChevronDown, GitCompare } from 'lucide-react'
import { HorizontalBarChart, DesktopPieChart, UsagePieChart } from '@/components/Charts'
import { getDistroMeta } from '@/lib/distros'

const usageLabels: Record<string, string> = {
  desktop: 'Desktop/Personal',
  programming: 'Programming',
  gaming: 'Gaming',
  server: 'Server',
  other: 'Other',
}

// Regenerate each page at most every 10 minutes instead of rendering on every
// request — faster responses and friendlier to crawl budget.
export const revalidate = 600

// Opt into the static/ISR path. Returning [] prerenders nothing at build (some
// distro names contain "/", which can't be a single dynamic segment), but each
// page is then generated on first visit and cached for `revalidate` seconds.
export async function generateStaticParams() {
  return []
}

function distroSeoDescription(name: string, count: number): string {
  return `Real hardware stats from ${count} ${name} submission${count !== 1 ? 's' : ''} on DistroInstall: popular desktop environments, kernels, GPUs, average RAM and CPU, plus how people use it.`
}

// "Based on" metadata uses short names (e.g. "Debian") but the DB may store a
// longer one ("Debian GNU/Linux"). Resolve to the real distro page if one
// exists, so we can link straight to it instead of a search.
async function resolveBasedOnDistro(term: string): Promise<string | null> {
  const rows = await prisma.submission.groupBy({
    by: ['distroName'],
    where: { distroName: { startsWith: term, mode: 'insensitive' } },
    _count: { distroName: true },
    orderBy: { _count: { distroName: 'desc' } },
    take: 1,
  })
  return rows[0]?.distroName ?? null
}

export async function generateMetadata({ params }: { params: { name: string } }): Promise<Metadata> {
  const distroName = decodeURIComponent(params.name)
  const url = `https://distroinstall.com/distro/${encodeURIComponent(distroName)}`
  const count = await prisma.submission.count({ where: { distroName } })

  if (count === 0) {
    return { title: `${distroName} — DistroInstall`, alternates: { canonical: url } }
  }

  const title = `${distroName}: hardware, desktops & kernels — DistroInstall`
  const description = distroSeoDescription(distroName, count)
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: { title, description, url, type: 'website' },
    twitter: { card: 'summary_large_image', title, description },
  }
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
  const basedOnSlug = meta?.basedOn ? await resolveBasedOnDistro(meta.basedOn) : null

  // Derive a crawlable, unique-per-distro text summary + FAQ from the live data.
  const total = stats.totalSubmissions
  const pct = (n: number) => Math.round((n / total) * 100)
  const usageLabel = (u: string) => (usageLabels[u] ?? u).toLowerCase()
  const topDesktop = stats.desktopStats[0]
  const secondDesktop = stats.desktopStats[1]
  const topKernel = stats.kernelStats[0]
  const topGpu = stats.gpuStats[0]
  const topUsage = [...stats.usageStats].sort((a, b) => b._count.usageType - a._count.usageType)[0]

  const summary: string[] = [
    `Based on ${total} community submission${total !== 1 ? 's' : ''}, here is what a typical ${distroName} setup looks like.`,
  ]
  if (topDesktop) summary.push(`The most common desktop environment is ${topDesktop.desktopEnv} (${pct(topDesktop._count.desktopEnv)}% of submissions)${secondDesktop ? `, followed by ${secondDesktop.desktopEnv}` : ''}.`)
  if (topKernel) summary.push(`The most reported Linux kernel is ${topKernel.kernel}.`)
  if (stats.avgRam != null) summary.push(`${distroName} machines have ${stats.avgRam.toFixed(1)} GB of RAM${stats.avgCpuCores != null ? ` and ${stats.avgCpuCores.toFixed(0)} CPU cores` : ''} on average.`)
  if (topGpu) summary.push(`The most frequently reported GPU is ${topGpu.gpu}.`)
  if (topUsage) summary.push(`Most people run ${distroName} for ${usageLabel(topUsage.usageType)} use.`)
  summary.push(`${physical} of these run on physical hardware and ${virtual_} in a virtual machine.`)

  const faqs: { q: string; a: string }[] = []
  if (topDesktop) faqs.push({
    q: `What is the most popular desktop environment on ${distroName}?`,
    a: `${topDesktop.desktopEnv} is the most popular desktop on ${distroName}, used in ${pct(topDesktop._count.desktopEnv)}% of its ${total} submissions${secondDesktop ? `, ahead of ${secondDesktop.desktopEnv}` : ''}.`,
  })
  if (stats.avgRam != null) faqs.push({
    q: `How much RAM do ${distroName} users have?`,
    a: `On average, ${distroName} machines have ${stats.avgRam.toFixed(1)} GB of RAM, based on ${total} community submission${total !== 1 ? 's' : ''}.`,
  })
  if (topKernel) faqs.push({
    q: `Which Linux kernel is most common on ${distroName}?`,
    a: `The most frequently reported kernel on ${distroName} is ${topKernel.kernel}.`,
  })
  if (topUsage) faqs.push({
    q: `What do people use ${distroName} for?`,
    a: `Most ${distroName} users run it for ${usageLabel(topUsage.usageType)} use.`,
  })
  faqs.push({
    q: `Is ${distroName} used more on real hardware or in virtual machines?`,
    a: `Of ${total} submission${total !== 1 ? 's' : ''}, ${physical} run on physical machines and ${virtual_} run in a virtual machine.`,
  })
  if (topGpu) faqs.push({
    q: `What GPU is most common with ${distroName}?`,
    a: `${topGpu.gpu} is the most frequently reported GPU among ${distroName} users.`,
  })

  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(f => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  }

  const pageUrl = `https://distroinstall.com/distro/${encodeURIComponent(distroName)}`
  const jsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://distroinstall.com' },
        { '@type': 'ListItem', position: 2, name: 'Distributions', item: 'https://distroinstall.com/distros' },
        { '@type': 'ListItem', position: 3, name: distroName, item: pageUrl },
      ],
    },
    {
      '@context': 'https://schema.org',
      '@type': 'Dataset',
      name: `${distroName} hardware and usage statistics`,
      description: meta
        ? `${meta.description} ${distroSeoDescription(distroName, stats.totalSubmissions)}`
        : distroSeoDescription(distroName, stats.totalSubmissions),
      url: pageUrl,
      isAccessibleForFree: true,
      creator: { '@type': 'Organization', name: 'DistroInstall', url: 'https://distroinstall.com' },
    },
    ...(faqs.length > 0 ? [faqJsonLd] : []),
  ]

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="container mx-auto px-4 py-12">

        {/* Back + header */}
        <div className="mb-10">
          <nav className="flex flex-wrap items-center gap-2 text-sm text-gray-400 mb-6" aria-label="Breadcrumb">
            <Link href="/" className="hover:text-white transition-colors">Home</Link>
            <span className="text-gray-600">/</span>
            <Link href="/distros" className="hover:text-white transition-colors">Distributions</Link>
            <span className="text-gray-600">/</span>
            <span className="text-gray-300">{distroName}</span>
          </nav>
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
              <Link
                href={basedOnSlug ? `/distro/${encodeURIComponent(basedOnSlug)}` : `/distros?q=${encodeURIComponent(meta.basedOn)}`}
                className="text-xs px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 border border-purple-400/30 hover:bg-purple-500/30 transition-colors"
              >
                Based on {meta.basedOn}
              </Link>
            )}
          </div>
          <p className="text-gray-300 leading-relaxed mb-5">
            {meta
              ? meta.description
              : `${distroName} is a community-submitted Linux distribution. We don't have a curated description for it yet.`}
          </p>
          <div className="flex flex-wrap gap-3">
            <a
              href={meta ? meta.url : `https://duckduckgo.com/?q=${encodeURIComponent(distroName + ' linux distribution')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-sm font-medium rounded-lg border border-white/20 transition-colors"
            >
              <ExternalLink size={15} />
              {meta ? 'Visit official website' : `Search for ${distroName}`}
            </a>
            <Link
              href="/compare"
              className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-sm font-medium rounded-lg border border-white/20 transition-colors"
            >
              <GitCompare size={15} />
              Compare distributions
            </Link>
          </div>
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

        {/* At a glance — text summary (unique, crawlable content per distro) */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 mb-10">
          <h2 className="text-2xl font-bold text-white mb-4">{distroName} at a glance</h2>
          <p className="text-gray-300 leading-relaxed">{summary.join(' ')}</p>
        </div>

        {/* Charts grid */}
        <div className="grid lg:grid-cols-2 gap-8 mb-8">

          {/* Versions */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2.5"><Package className="text-purple-400 shrink-0" size={22} />Versions</h2>
            {stats.versionStats.length > 0
              ? <HorizontalBarChart
                  data={stats.versionStats.map(v => ({ label: v.distroVersion, count: v._count.distroVersion }))}
                />
              : <p className="text-gray-400 text-center py-8">No data</p>}
          </div>

          {/* Desktop environments */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2.5"><Palette className="text-purple-400 shrink-0" size={22} />Desktop Environments</h2>
            {stats.desktopStats.length > 0
              ? <DesktopPieChart data={stats.desktopStats} />
              : <p className="text-gray-400 text-center py-8">No data</p>}
          </div>

          {/* Usage types */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2.5"><Target className="text-purple-400 shrink-0" size={22} />Usage Types</h2>
            {stats.usageStats.length > 0
              ? <UsagePieChart data={stats.usageStats} labels={usageLabels} />
              : <p className="text-gray-400 text-center py-8">No data</p>}
          </div>

          {/* GPU distribution */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2.5"><Monitor className="text-purple-400 shrink-0" size={22} />GPUs</h2>
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
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2.5"><Layers className="text-purple-400 shrink-0" size={22} />Kernel Versions</h2>
            <HorizontalBarChart
              yAxisWidth={160}
              data={stats.kernelStats.map(k => ({ label: k.kernel, count: k._count.kernel }))}
            />
          </div>
        )}

        {/* FAQ — data-driven, with FAQPage structured data */}
        {faqs.length > 0 && (
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 mb-8">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2.5"><HelpCircle className="text-purple-400 shrink-0" size={22} />Frequently asked questions</h2>
            <div className="divide-y divide-white/10">
              {faqs.map((f, i) => (
                <details key={i} className="group py-3 first:pt-0 last:pb-0">
                  <summary className="flex items-center justify-between gap-3 cursor-pointer list-none [&::-webkit-details-marker]:hidden text-white font-medium hover:text-purple-300 transition-colors">
                    <h3 className="text-base font-medium">{f.q}</h3>
                    <ChevronDown size={18} className="text-gray-400 shrink-0 transition-transform group-open:rotate-180" />
                  </summary>
                  <p className="text-gray-400 text-sm leading-relaxed mt-2">{f.a}</p>
                </details>
              ))}
            </div>
          </div>
        )}

        {/* Recent submissions */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2.5"><Activity className="text-purple-400 shrink-0" size={22} />Recent Submissions</h2>
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
