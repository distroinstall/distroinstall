// app/page.tsx
import { prisma } from '@/lib/prisma'
import { Download, TrendingUp, Users, HardDrive } from 'lucide-react'

async function getStats() {
  const totalSubmissions = await prisma.submission.count()
  
  const topDistros = await prisma.submission.groupBy({
    by: ['distroName'],
    _count: { distroName: true },
    orderBy: { _count: { distroName: 'desc' } },
    take: 10
  })

  const topDesktops = await prisma.submission.groupBy({
    by: ['desktopEnv'],
    _count: { desktopEnv: true },
    orderBy: { _count: { desktopEnv: 'desc' } },
    take: 5
  })

  const usageStats = await prisma.submission.groupBy({
    by: ['usageType'],
    _count: { usageType: true },
    orderBy: { _count: { usageType: 'desc' } }
  })

  const virtualVsPhysical = await prisma.submission.groupBy({
    by: ['isVirtual'],
    _count: { isVirtual: true }
  })

  const recentSubmissions = await prisma.submission.findMany({
    take: 5,
    orderBy: { timestamp: 'desc' },
    select: {
      distroName: true,
      distroVersion: true,
      kernel: true,
      desktopEnv: true,
      timestamp: true,
      isVirtual: true,
      usageType: true
    }
  })

  return {
    totalSubmissions,
    topDistros,
    topDesktops,
    usageStats,
    virtualVsPhysical,
    recentSubmissions
  }
}

export default async function Home() {
  const stats = await getStats()

  const usageLabels: Record<string, string> = {
    desktop: '🖥️ Escritorio/Personal',
    programming: '💻 Programación',
    gaming: '🎮 Gaming',
    server: '🖥️ Servidor',
    other: '📦 Otro'
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-7xl font-bold text-white mb-4">
            🐧 DistroInstall
          </h1>
          <p className="text-2xl text-gray-300 mb-8">
            Real stats from real Linux users
          </p>
          
          {/* Install Command */}
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

        {/* Stats Overview */}
        <div className="grid md:grid-cols-4 gap-6 mb-12">
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
            <div className="flex items-center gap-3 mb-2">
              <Users className="text-blue-400" size={32} />
              <div>
                <p className="text-gray-300 text-sm">Total Submissions</p>
                <p className="text-4xl font-bold text-white">{stats.totalSubmissions}</p>
              </div>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
            <div className="flex items-center gap-3 mb-2">
              <TrendingUp className="text-green-400" size={32} />
              <div>
                <p className="text-gray-300 text-sm">Distros Tracked</p>
                <p className="text-4xl font-bold text-white">{stats.topDistros.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
            <div className="flex items-center gap-3 mb-2">
              <HardDrive className="text-purple-400" size={32} />
              <div>
                <p className="text-gray-300 text-sm">Physical Machines</p>
                <p className="text-4xl font-bold text-white">
                  {stats.virtualVsPhysical.find(v => !v.isVirtual)?._count.isVirtual || 0}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
            <div className="flex items-center gap-3 mb-2">
              <div className="text-3xl">💻</div>
              <div>
                <p className="text-gray-300 text-sm">Virtual Machines</p>
                <p className="text-4xl font-bold text-white">
                  {stats.virtualVsPhysical.find(v => v.isVirtual)?._count.isVirtual || 0}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Top Distros */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
            <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
              🏆 Top Distributions
            </h2>
            <div className="space-y-4">
              {stats.topDistros.map((distro, index) => {
                const percentage = (distro._count.distroName / stats.totalSubmissions) * 100
                return (
                  <div key={distro.distroName} className="group">
                    <div className="flex justify-between items-center mb-2">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl font-bold text-white/50 w-8">
                          #{index + 1}
                        </span>
                        <span className="text-lg font-semibold text-white group-hover:text-blue-400 transition-colors">
                          {distro.distroName}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-white font-bold">{distro._count.distroName}</span>
                        <span className="text-gray-400 text-sm ml-2">
                          ({percentage.toFixed(1)}%)
                        </span>
                      </div>
                    </div>
                    <div className="bg-white/10 rounded-full h-3 overflow-hidden">
                      <div 
                        className="bg-gradient-to-r from-blue-500 to-purple-500 h-full rounded-full transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Desktop Environments */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
            <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
              🎨 Desktop Environments
            </h2>
            <div className="space-y-4">
              {stats.topDesktops.map((de, index) => {
                const percentage = (de._count.desktopEnv / stats.totalSubmissions) * 100
                return (
                  <div key={de.desktopEnv} className="group">
                    <div className="flex justify-between items-center mb-2">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl font-bold text-white/50 w-8">
                          #{index + 1}
                        </span>
                        <span className="text-lg font-semibold text-white group-hover:text-purple-400 transition-colors">
                          {de.desktopEnv}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-white font-bold">{de._count.desktopEnv}</span>
                        <span className="text-gray-400 text-sm ml-2">
                          ({percentage.toFixed(1)}%)
                        </span>
                      </div>
                    </div>
                    <div className="bg-white/10 rounded-full h-3 overflow-hidden">
                      <div 
                        className="bg-gradient-to-r from-purple-500 to-pink-500 h-full rounded-full transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Usage Types */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
            <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
              🎯 Usage Types
            </h2>
            <div className="space-y-4">
              {stats.usageStats.map((usage) => {
                const percentage = (usage._count.usageType / stats.totalSubmissions) * 100
                return (
                  <div key={usage.usageType} className="group">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-lg font-semibold text-white group-hover:text-green-400 transition-colors">
                        {usageLabels[usage.usageType] || usage.usageType}
                      </span>
                      <div className="text-right">
                        <span className="text-white font-bold">{usage._count.usageType}</span>
                        <span className="text-gray-400 text-sm ml-2">
                          ({percentage.toFixed(1)}%)
                        </span>
                      </div>
                    </div>
                    <div className="bg-white/10 rounded-full h-3 overflow-hidden">
                      <div 
                        className="bg-gradient-to-r from-green-500 to-emerald-500 h-full rounded-full transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Recent Submissions */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
            <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
              ⚡ Recent Submissions
            </h2>
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
                    <div className="flex gap-2">
                      {sub.isVirtual ? (
                        <span className="text-xs bg-purple-500/20 text-purple-300 px-2 py-1 rounded">
                          Virtual
                        </span>
                      ) : (
                        <span className="text-xs bg-blue-500/20 text-blue-300 px-2 py-1 rounded">
                          Physical
                        </span>
                      )}
                    </div>
                  </div>
                  <p className="text-gray-500 text-xs">
                    {new Date(sub.timestamp).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer CTA */}
        <div className="mt-16 text-center">
          <div className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 backdrop-blur-lg rounded-2xl p-12 border border-white/20">
            <h2 className="text-4xl font-bold text-white mb-4">
              Join the Community
            </h2>
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