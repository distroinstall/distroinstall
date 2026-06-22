import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { prisma } from '@/lib/prisma'
import { DistroIndex } from '@/components/DistroIndex'

export const metadata = {
  title: 'All Linux distributions — DistroInstall',
  description:
    'Browse every Linux distribution submitted by the community, with submission counts. Search and open any distro to see its hardware, desktops, kernels and usage.',
}

export default async function DistrosPage() {
  const grouped = await prisma.submission.groupBy({
    by: ['distroName'],
    _count: { distroName: true },
    orderBy: { _count: { distroName: 'desc' } },
  })

  const distros = grouped.map(g => ({ name: g.distroName, count: g._count.distroName }))

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto px-4 py-12 max-w-4xl">

        <Link
          href="/"
          className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-10"
        >
          <ArrowLeft size={18} />
          Back to home
        </Link>

        <h1 className="text-4xl font-bold text-white mb-3">Linux distributions</h1>
        <p className="text-gray-300 mb-8">
          Every distribution submitted by the community so far. Search for yours, or open any one
          to see its hardware averages, desktops, kernels and usage breakdown.
        </p>

        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 sm:p-8 border border-white/20">
          {distros.length > 0 ? (
            <DistroIndex distros={distros} />
          ) : (
            <p className="text-gray-400 text-center py-16">No submissions yet — be the first!</p>
          )}
        </div>

      </div>
    </main>
  )
}

export const revalidate = 600
