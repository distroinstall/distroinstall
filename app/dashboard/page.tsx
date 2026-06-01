import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import Image from 'next/image'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { DeleteSubmissionButton } from '@/components/DeleteSubmissionButton'
import { ClaimTokenForm } from '@/components/ClaimTokenForm'

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

const usageLabels: Record<string, string> = {
  desktop: 'Desktop',
  programming: 'Programming',
  gaming: 'Gaming',
  server: 'Server',
  other: 'Other',
}

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user) redirect('/login')

  const [submissions, submissionToken] = await Promise.all([
    getUserSubmissions(session.user.id),
    getOrCreateSubmissionToken(session.user.id),
  ])

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
          <div>
            <h1 className="text-4xl font-bold text-white">
              {session.user.name ?? 'My Dashboard'}
            </h1>
            <p className="text-gray-400">{session.user.email}</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-3 gap-4 mb-10">
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-5 border border-white/20">
            <p className="text-gray-400 text-sm">My submissions</p>
            <p className="text-4xl font-bold text-white mt-1">{submissions.length}</p>
          </div>
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-5 border border-white/20">
            <p className="text-gray-400 text-sm">Machines</p>
            <p className="text-4xl font-bold text-white mt-1">
              {new Set(submissions.map(s => s.token)).size}
            </p>
          </div>
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-5 border border-white/20">
            <p className="text-gray-400 text-sm">Most used distro</p>
            <p className="text-2xl font-bold text-white mt-1 truncate">
              {submissions.length > 0
                ? Object.entries(
                    submissions.reduce((acc, s) => {
                      acc[s.distroName] = (acc[s.distroName] ?? 0) + 1
                      return acc
                    }, {} as Record<string, number>)
                  ).sort((a, b) => b[1] - a[1])[0][0]
                : '—'}
            </p>
          </div>
        </div>

        {/* Submissions table */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 mb-8">
          <h2 className="text-2xl font-bold text-white mb-6">🐧 My Submissions</h2>

          {submissions.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-400 mb-4">No submissions linked to your account yet.</p>
              <p className="text-gray-500 text-sm">
                Run the script while logged in, or claim your existing submissions below.
              </p>
            </div>
          ) : (
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
          )}
        </div>

        {/* Personal submission token */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 mb-8">
          <h2 className="text-2xl font-bold text-white mb-2">🔑 Your submission token</h2>
          <p className="text-gray-400 text-sm mb-4">
            Use this token in the script so submissions link directly to your account — no need to claim manually.
          </p>
          <div className="flex items-center gap-3 bg-black/30 rounded-lg px-4 py-3 border border-white/10">
            <code className="text-green-400 text-sm flex-1 break-all">{submissionToken}</code>
          </div>
          <p className="text-gray-500 text-xs mt-3">
            When the script asks <span className="text-gray-400">&quot;¿Tienes un token de usuario?&quot;</span>, pega este token.
            También puedes guardarlo en <code className="text-green-400">~/.distroinstall_token</code> para que se cargue automáticamente.
          </p>
        </div>

        {/* Claim token */}
        <ClaimTokenForm />

      </div>
    </main>
  )
}
