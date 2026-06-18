import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft, Download, Settings } from 'lucide-react'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { SettingsForm } from '@/components/SettingsForm'
import { DeleteAccountButton } from '@/components/DeleteAccountButton'

export const metadata = {
  title: 'Settings — DistroInstall',
}

export default async function SettingsPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) redirect('/login')

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { name: true, username: true, email: true, image: true },
  })
  if (!user) redirect('/login')

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto px-4 py-12 max-w-2xl">

        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-10"
        >
          <ArrowLeft size={18} />
          Back to dashboard
        </Link>

        <h1 className="text-4xl font-bold text-white mb-10 flex items-center gap-3"><Settings className="text-purple-400 shrink-0" size={30} />Settings</h1>

        {/* Profile */}
        <section className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 mb-8">
          <h2 className="text-2xl font-bold text-white mb-6">Profile</h2>

          <div className="flex items-center gap-4 mb-8">
            {user.image ? (
              <Image
                src={user.image}
                alt={user.name ?? ''}
                width={64}
                height={64}
                className="rounded-full border-2 border-purple-400/50"
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-purple-600 flex items-center justify-center text-white text-2xl font-bold">
                {user.name?.[0] ?? user.email?.[0] ?? '?'}
              </div>
            )}
            <p className="text-gray-400 text-sm">
              Your photo comes from your sign-in provider (Google / GitHub).
            </p>
          </div>

          <SettingsForm initialName={user.name ?? ''} initialUsername={user.username ?? ''} />
        </section>

        {/* Account info */}
        <section className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 mb-8">
          <h2 className="text-2xl font-bold text-white mb-6">Account</h2>
          <div className="mb-6">
            <p className="text-sm font-medium text-gray-300 mb-1">Email</p>
            <p className="text-white">{user.email}</p>
            <p className="text-gray-500 text-xs mt-1">
              Your email is tied to your sign-in and can&apos;t be changed here.
            </p>
          </div>

          <div className="border-t border-white/10 pt-6 flex flex-col sm:flex-row gap-4 items-start">
            <a
              href="/api/export"
              download="distroinstall-data.json"
              className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-sm font-medium rounded-lg border border-white/20 transition-colors"
            >
              <Download size={15} />
              Export my data (JSON)
            </a>
            <DeleteAccountButton />
          </div>
          <p className="text-gray-500 text-xs mt-4">
            Your data rights are explained in our{' '}
            <Link href="/privacy" className="text-blue-400 hover:underline">
              Privacy Policy
            </Link>.
          </p>
        </section>

      </div>
    </main>
  )
}
