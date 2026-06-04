import Link from 'next/link'
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { ArrowLeft, Clock, HardDrive, Cpu, Database, Monitor } from 'lucide-react'

async function getProfileData(token: string) {
  const submissions = await prisma.submission.findMany({
    where: { token },
    orderBy: { timestamp: 'desc' },
  })
  if (submissions.length === 0) return null
  return submissions
}

const usageLabels: Record<string, string> = {
  desktop: 'Desktop/Personal',
  programming: 'Programming',
  gaming: 'Gaming',
  server: 'Server',
  other: 'Other',
}

export default async function ProfilePage({ params }: { params: { token: string } }) {
  const token = decodeURIComponent(params.token)
  const submissions = await getProfileData(token)
  if (!submissions) notFound()

  const latest = submissions[0]
  const shortToken = token.length > 24 ? token.slice(0, 24) + '…' : token

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto px-4 py-12">

        {/* Back */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-8"
        >
          <ArrowLeft size={18} />
          Back to all distros
        </Link>

        {/* Header */}
        <div className="mb-10">
          <h1 className="text-5xl font-bold text-white mb-2">🐧 My System Profile</h1>
          <p className="text-gray-400 text-sm font-mono">
            Token: <span className="text-gray-300">{shortToken}</span>
          </p>
          <p className="text-gray-500 text-sm mt-1">
            {submissions.length} submission{submissions.length !== 1 ? 's' : ''} •{' '}
            First seen {new Date(submissions[submissions.length - 1].timestamp).toLocaleDateString()}
          </p>
        </div>

        {/* Current setup */}
        <div className="mb-4">
          <h2 className="text-xl font-semibold text-gray-300 mb-4">Current setup</h2>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-5 border border-white/20">
            <p className="text-gray-400 text-xs mb-1">Distribution</p>
            <p className="text-white font-bold text-xl">{latest.distroName}</p>
            <p className="text-gray-400 text-sm">{latest.distroVersion}</p>
          </div>

          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-5 border border-white/20">
            <p className="text-gray-400 text-xs mb-1">Desktop</p>
            <p className="text-white font-bold text-xl">{latest.desktopEnv}</p>
            <p className="text-gray-400 text-sm">Kernel {latest.kernel}</p>
          </div>

          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-5 border border-white/20 col-span-1 lg:col-span-2">
            <p className="text-gray-400 text-xs mb-1">Hardware</p>
            <p className="text-white font-bold">{latest.cpu}</p>
            <div className="flex gap-4 mt-2 text-sm">
              <span className="text-orange-300">{latest.cpuCores} cores / {latest.cpuThreads} threads</span>
              <span className="text-cyan-300">{latest.ram} GB RAM</span>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-5 border border-white/20 col-span-1 md:col-span-2 lg:col-span-4">
            <p className="text-gray-400 text-xs mb-1">GPU</p>
            <p className="text-white font-semibold">{latest.gpu}</p>
            <div className="flex gap-3 mt-2">
              <span className={`text-xs px-2 py-1 rounded ${
                latest.isVirtual ? 'bg-purple-500/20 text-purple-300' : 'bg-blue-500/20 text-blue-300'
              }`}>
                {latest.isVirtual ? 'Virtual Machine' : 'Physical Machine'}
              </span>
              <span className="text-xs px-2 py-1 rounded bg-white/10 text-gray-300">
                {usageLabels[latest.usageType] || latest.usageType}
              </span>
            </div>
          </div>
        </div>

        {/* History — only shown if more than one submission */}
        {submissions.length > 1 && (
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 mb-8">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
              <Clock size={22} className="text-purple-400" />
              History
            </h2>
            <div className="space-y-4">
              {submissions.map((sub, i) => (
                <div
                  key={sub.id}
                  className={`rounded-xl p-5 border transition-colors ${
                    i === 0
                      ? 'bg-white/10 border-purple-400/40'
                      : 'bg-white/5 border-white/10'
                  }`}
                >
                  <div className="flex justify-between items-start flex-wrap gap-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-white font-bold text-lg">
                          {sub.distroName} {sub.distroVersion}
                        </span>
                        {i === 0 && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-purple-500/30 text-purple-300">
                            current
                          </span>
                        )}
                      </div>
                      <p className="text-gray-400 text-sm">
                        {sub.desktopEnv} • Kernel {sub.kernel}
                      </p>
                    </div>
                    <p className="text-gray-500 text-sm">
                      {new Date(sub.timestamp).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-4 mt-3 text-sm">
                    <span className="text-orange-300">{sub.cpuCores} cores</span>
                    <span className="text-cyan-300">{sub.ram} GB RAM</span>
                    <span className="text-pink-300 truncate max-w-xs" title={sub.gpu}>{sub.gpu}</span>
                    <span className={`${sub.isVirtual ? 'text-purple-300' : 'text-blue-300'}`}>
                      {sub.isVirtual ? 'Virtual' : 'Physical'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Share */}
        <div className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 backdrop-blur-lg rounded-2xl p-8 border border-white/20 text-center">
          <h2 className="text-2xl font-bold text-white mb-2">Share your profile</h2>
          <p className="text-gray-400 mb-4">Anyone with this link can see your setup</p>
          <code className="inline-block bg-black/50 px-4 py-2 rounded-lg text-green-400 text-sm break-all">
            https://distroinstall.vercel.app/u/{token}
          </code>
          <p className="text-gray-500 text-xs mt-4">
            Want to update your data?{' '}
            <Link href="/" className="text-blue-400 hover:underline">
              Run the script again
            </Link>{' '}
            with your saved token.
          </p>
        </div>

      </div>
    </main>
  )
}

export const dynamic = 'force-dynamic'
