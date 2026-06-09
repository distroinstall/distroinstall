import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { DeleteSubmissionButton } from '@/components/DeleteSubmissionButton'
import { ClaimTokenForm } from '@/components/ClaimTokenForm'
import { CompareStats } from '@/components/CompareStats'
import { CopyButton, CopyBlock } from '@/components/CopyButton'
import { BadgeDisplay } from '@/components/BadgeDisplay'
import { computeEarnedBadges } from '@/lib/badges'
import { ExternalLink, Settings } from 'lucide-react'
import { nanoid } from 'nanoid'

async function getOrCreateSubmissionToken(userId: string): Promise<string> {
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { submissionToken: true } })
  if (user?.submissionToken) return user.submissionToken
  const token = `usr_${nanoid(20)}`
  await prisma.user.update({ where: { id: userId }, data: { submissionToken: token } })
  return token
}

async function getUserSubmissions(userId: string) {
  return prisma.submission.findMany({
    where: { userId },
    orderBy: { timestamp: 'desc' },
  })
}

async function getCompareData(latest: { ram: number; cpuCores: number; distroName: string }) {
  const [ramBelow, cpuBelow, total, distroRanking, avgStats] = await Promise.all([
    prisma.submission.count({ where: { ram: { lt: latest.ram } } }),
    prisma.submission.count({ where: { cpuCores: { lt: latest.cpuCores } } }),
    prisma.submission.count(),
    prisma.submission.groupBy({
      by: ['distroName'],
      _count: { distroName: true },
      orderBy: { _count: { distroName: 'desc' } },
    }),
    prisma.submission.aggregate({
      _avg: { ram: true, cpuCores: true },
    }),
  ])

  const distroRank = distroRanking.findIndex(d => d.distroName === latest.distroName) + 1

  return {
    ramPercentile: total > 0 ? (ramBelow / total) * 100 : 0,
    cpuPercentile: total > 0 ? (cpuBelow / total) * 100 : 0,
    distroRank: distroRank || distroRanking.length,
    totalDistros: distroRanking.length,
    avgRam: avgStats._avg.ram ?? 0,
    avgCpuCores: avgStats._avg.cpuCores ?? 0,
  }
}

async function awardAndGetBadges(userId: string, submissions: { distroName: string; ram: number }[], userCreatedAt: Date) {
  const userRank = await prisma.user.count({ where: { createdAt: { lte: userCreatedAt } } })
  const earned = computeEarnedBadges({ submissions, userRank })

  await Promise.all(
    earned.map(badgeType =>
      prisma.badge.upsert({
        where: { userId_badgeType: { userId, badgeType } },
        update: {},
        create: { userId, badgeType },
      })
    )
  )

  return prisma.badge.findMany({ where: { userId }, orderBy: { earnedAt: 'asc' } })
}

const usageLabels: Record<string, string> = {
  desktop: 'Desktop/Personal',
  programming: 'Programming',
  gaming: 'Gaming',
  server: 'Server',
  other: 'Other',
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: { compare?: string }
}) {
  const session = await getServerSession(authOptions)
  if (!session?.user) redirect('/login')

  const userRecord = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { createdAt: true, submissionToken: true },
  })

  const [submissions, submissionToken] = await Promise.all([
    getUserSubmissions(session.user.id),
    getOrCreateSubmissionToken(session.user.id),
  ])

  const latest = submissions[0]
  // Which submission drives the "How do you compare?" panel (defaults to latest).
  const selected = submissions.find(s => s.id === searchParams.compare) ?? latest
  const compareData = selected ? await getCompareData(selected) : null
  const badges = await awardAndGetBadges(
    session.user.id,
    submissions,
    userRecord?.createdAt ?? new Date(),
  )

  const distrosTried = new Set(submissions.map(s => s.distroName)).size

  // Distro timeline: unique distros by first seen date
  const distroFirstSeen = new Map<string, Date>()
  for (const sub of [...submissions].reverse()) {
    distroFirstSeen.set(sub.distroName, sub.timestamp)
  }
  const timeline = Array.from(distroFirstSeen.entries())
    .sort((a, b) => new Date(a[1]).getTime() - new Date(b[1]).getTime())

  const hasSubmissions = submissions.length > 0

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto px-4 py-12">

        {/* Header */}
        <div className="flex items-center gap-4 mb-10">
          {session.user.image ? (
            <Image
              src={session.user.image}
              alt={session.user.name ?? ''}
              width={64}
              height={64}
              className="rounded-full border-2 border-purple-400/50"
            />
          ) : (
            <div className="w-16 h-16 rounded-full bg-purple-600 flex items-center justify-center text-white text-2xl font-bold">
              {session.user.name?.[0] ?? '?'}
            </div>
          )}
          <div className="min-w-0">
            <h1 className="text-4xl font-bold text-white truncate">
              {session.user.name ?? 'My Dashboard'}
            </h1>
            <p className="text-gray-400">{session.user.email}</p>
          </div>
          <Link
            href="/settings"
            className="ml-auto flex items-center gap-1.5 text-sm text-gray-400 hover:text-white transition-colors"
          >
            <Settings size={16} />
            <span className="hidden sm:inline">Settings</span>
          </Link>
        </div>

        {/* Get started — only when the user has no submissions yet */}
        {!hasSubmissions && (
          <div className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 backdrop-blur-lg rounded-2xl p-8 border border-white/20 mb-8">
            <h2 className="text-2xl font-bold text-white mb-2">🚀 Get started</h2>
            <p className="text-gray-300 mb-5">
              Run the script to send your first system snapshot. Paste your token when it asks,
              and your submissions will link straight to this account.
            </p>
            <CopyBlock text="curl -sSL https://distroinstall.com/install.sh | bash" />

            <p className="text-gray-300 text-sm mt-5 mb-2 font-medium">Your token:</p>
            <div className="flex items-center gap-3 bg-black/30 rounded-lg px-4 py-3 border border-white/10">
              <code className="text-green-400 text-sm flex-1 break-all">{submissionToken}</code>
              <CopyButton text={submissionToken} />
            </div>
            <p className="text-gray-500 text-xs mt-4">
              Not sure what the script does?{' '}
              <Link href="/how-it-works" className="text-blue-400 hover:underline">
                See exactly what it collects
              </Link>.
            </p>
          </div>
        )}

        {/* Stats — only meaningful once there's data */}
        {hasSubmissions && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-5 border border-white/20">
              <p className="text-gray-400 text-sm">My submissions</p>
              <p className="text-4xl font-bold text-white mt-1">{submissions.length}</p>
            </div>
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-5 border border-white/20">
              <p className="text-gray-400 text-sm">Distros tried</p>
              <p className="text-4xl font-bold text-white mt-1">{distrosTried}</p>
            </div>
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-5 border border-white/20">
              <p className="text-gray-400 text-sm">Most used distro</p>
              <p className="text-2xl font-bold text-white mt-1 truncate">
                {Object.entries(
                  submissions.reduce((acc, s) => {
                    acc[s.distroName] = (acc[s.distroName] ?? 0) + 1
                    return acc
                  }, {} as Record<string, number>)
                ).sort((a, b) => b[1] - a[1])[0][0]}
              </p>
            </div>
          </div>
        )}

        {/* Badges — always shown, with locked ones to chase */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 mb-8">
          <h2 className="text-2xl font-bold text-white mb-6">🏅 My Badges</h2>
          <BadgeDisplay badges={badges} showLocked />
        </div>

        {/* Compare stats */}
        {selected && compareData && (
          <CompareStats
            ram={selected.ram}
            cpuCores={selected.cpuCores}
            cpuThreads={selected.cpuThreads}
            gpu={selected.gpu}
            distroName={selected.distroName}
            usageType={selected.usageType}
            ramPercentile={compareData.ramPercentile}
            cpuPercentile={compareData.cpuPercentile}
            distroRank={compareData.distroRank}
            totalDistros={compareData.totalDistros}
            avgRam={compareData.avgRam}
            avgCpuCores={compareData.avgCpuCores}
            isLatest={selected.id === latest?.id}
            selector={
              submissions.length > 1 ? (
                <div className="flex flex-wrap gap-2 mb-6">
                  {submissions.map(s => (
                    <Link
                      key={s.id}
                      href={`/dashboard?compare=${s.id}`}
                      scroll={false}
                      className={`text-xs px-3 py-1.5 rounded-lg border transition-colors ${
                        s.id === selected.id
                          ? 'bg-purple-500/30 border-purple-400/50 text-purple-200'
                          : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'
                      }`}
                    >
                      {s.distroName} · {new Date(s.timestamp).toLocaleDateString()}
                    </Link>
                  ))}
                </div>
              ) : null
            }
          />
        )}

        {/* Distro timeline — only shown when 2+ distros */}
        {timeline.length >= 2 && (
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 mb-8">
            <h2 className="text-2xl font-bold text-white mb-6">🗺️ My Distro Journey</h2>
            <div className="relative pl-8">
              <div className="absolute left-3 top-2 bottom-2 w-px bg-white/15" />
              {timeline.map(([distro, firstSeen]) => {
                const isCurrent = distro === latest?.distroName
                return (
                  <div key={distro} className="relative mb-6 last:mb-0">
                    <div className={`absolute -left-[21px] w-3 h-3 rounded-full border-2 border-slate-900 ${isCurrent ? 'bg-purple-400' : 'bg-slate-500'}`} />
                    <div className="flex items-center gap-3 flex-wrap">
                      <Link
                        href={`/distro/${encodeURIComponent(distro)}`}
                        className={`font-bold text-lg hover:underline transition-colors ${isCurrent ? 'text-purple-300' : 'text-white'}`}
                      >
                        {distro}
                      </Link>
                      {isCurrent && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-purple-500/30 text-purple-300">
                          current
                        </span>
                      )}
                      <span className="text-gray-500 text-sm ml-auto">
                        First seen {new Date(firstSeen).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Submissions table — only when there's data */}
        {hasSubmissions && (
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 mb-8">
            <h2 className="text-2xl font-bold text-white mb-6">🐧 My Submissions</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-gray-400 text-sm text-left border-b border-white/10">
                    <th className="pb-3 pr-4 font-medium">Distro</th>
                    <th className="pb-3 pr-4 font-medium">Desktop</th>
                    <th className="pb-3 pr-4 font-medium text-right">RAM</th>
                    <th className="pb-3 pr-4 font-medium text-right">CPU</th>
                    <th className="pb-3 pr-4 font-medium">GPU</th>
                    <th className="pb-3 pr-4 font-medium">Type</th>
                    <th className="pb-3 pr-4 font-medium">Usage</th>
                    <th className="pb-3 pr-4 font-medium">Date</th>
                    <th className="pb-3 font-medium"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {submissions.map(sub => (
                    <tr key={sub.id} className="hover:bg-white/5 transition-colors">
                      <td className="py-3 pr-4">
                        <p className="text-white font-semibold">{sub.distroName}</p>
                        <p className="text-gray-500 text-xs">{sub.distroVersion}</p>
                      </td>
                      <td className="py-3 pr-4 text-gray-300 text-sm">{sub.desktopEnv}</td>
                      <td className="py-3 pr-4 text-cyan-300 text-right font-mono text-sm">{sub.ram} GB</td>
                      <td className="py-3 pr-4 text-right font-mono text-sm whitespace-nowrap">
                        <span className="text-orange-300">{sub.cpuCores}c</span>
                        <span className="text-gray-500"> / </span>
                        <span className="text-yellow-300">{sub.cpuThreads}t</span>
                      </td>
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
                      <td className="py-3 pr-4 text-gray-300 text-sm">
                        {usageLabels[sub.usageType] ?? sub.usageType}
                      </td>
                      <td className="py-3 pr-4 text-gray-500 text-xs whitespace-nowrap">
                        {new Date(sub.timestamp).toLocaleDateString()}
                      </td>
                      <td className="py-3">
                        <DeleteSubmissionButton id={sub.id} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Personal submission token — full reference (hidden in empty state, shown in the Get started card instead) */}
        {hasSubmissions && (
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 mb-8">
            <div className="flex items-start justify-between gap-4 flex-wrap mb-2">
              <h2 className="text-2xl font-bold text-white">🔑 Your submission token</h2>
              <Link
                href={`/u/${submissionToken}`}
                className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-white transition-colors"
              >
                <ExternalLink size={14} />
                View public profile
              </Link>
            </div>
            <p className="text-gray-400 text-sm mb-4">
              Use this token in the script so submissions link directly to your account — no need to claim manually.
            </p>
            <div className="flex items-center gap-3 bg-black/30 rounded-lg px-4 py-3 border border-white/10">
              <code className="text-green-400 text-sm flex-1 break-all">{submissionToken}</code>
              <CopyButton text={submissionToken} />
            </div>
            <p className="text-gray-500 text-xs mt-3">
              When the script asks for a token, paste this one.
              You can also save it to <code className="text-green-400">~/.distroinstall_token</code> so it loads automatically.
            </p>
          </div>
        )}

        {/* Claim token */}
        <ClaimTokenForm />

        {/* Account management lives in Settings */}
        <Link
          href="/settings"
          className="mt-8 flex items-center gap-3 bg-white/10 hover:bg-white/15 backdrop-blur-lg rounded-2xl p-6 border border-white/20 transition-colors"
        >
          <Settings size={20} className="text-gray-400" />
          <div>
            <p className="text-white font-semibold">Account settings</p>
            <p className="text-gray-400 text-sm">Edit your profile, export your data or delete your account.</p>
          </div>
          <ExternalLink size={16} className="text-gray-500 ml-auto" />
        </Link>

      </div>
    </main>
  )
}
