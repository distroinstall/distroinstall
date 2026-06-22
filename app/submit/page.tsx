import Link from 'next/link'
import { getServerSession } from 'next-auth'
import { ArrowLeft, Terminal } from 'lucide-react'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { SubmitForm } from '@/components/SubmitForm'

export const metadata = {
  title: 'Submit your setup — DistroInstall',
  description:
    'Add your Linux setup to the community stats by hand — no script required. Enter your distro, desktop, CPU, RAM and GPU and see how you compare.',
}

export default async function SubmitPage() {
  const session = await getServerSession(authOptions)

  let initialToken = ''
  let accountName = ''
  if (session?.user?.id) {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { submissionToken: true, name: true, email: true },
    })
    if (user?.submissionToken) {
      initialToken = user.submissionToken
      accountName = user.name ?? user.email ?? ''
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto px-4 py-12 max-w-2xl">

        <Link
          href="/"
          className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-10"
        >
          <ArrowLeft size={18} />
          Back to home
        </Link>

        <h1 className="text-4xl font-bold text-white mb-3">Submit your setup</h1>
        <p className="text-gray-300 mb-8">
          Prefer not to run anything? Add your Linux setup by hand. Only the distribution is
          required — fill in whatever you know and skip the rest.
        </p>

        <div className="flex items-start gap-2.5 bg-blue-500/10 border border-blue-400/30 rounded-lg p-4 mb-8 text-sm text-gray-300">
          <Terminal size={18} className="text-blue-300 shrink-0 mt-0.5" />
          <span>
            Not sure of your exact specs? Run{' '}
            <code className="text-green-300 bg-white/10 px-1.5 py-0.5 rounded">python3 distroinstall.py --dry-run</code>{' '}
            to see your values (it sends nothing), or check the{' '}
            <Link href="/how-it-works" className="text-blue-400 hover:underline">how it works</Link> page.
          </span>
        </div>

        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 sm:p-8 border border-white/20">
          <SubmitForm initialToken={initialToken} accountName={accountName} />
        </div>

      </div>
    </main>
  )
}

export const dynamic = 'force-dynamic'
