'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useSession, signOut } from 'next-auth/react'
import Image from 'next/image'
import { LoginModal } from './LoginModal'
import { Logo } from './Logo'
import { GithubIcon } from './GithubIcon'
import { GITHUB_URL } from '@/lib/utils'

export function Navbar() {
  const { data: session, status } = useSession()
  const [showLogin, setShowLogin] = useState(false)

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-40 bg-slate-900/80 backdrop-blur-lg border-b border-white/10">
        <div className="container mx-auto px-4 h-14 flex items-center justify-between">

          <Link href="/" className="flex items-center gap-2 text-white font-bold text-lg">
            <Logo size={26} />
            DistroInstall
          </Link>

          <div className="flex items-center gap-3">
            <Link href="/how-it-works" className="text-gray-400 hover:text-white text-sm transition-colors hidden sm:block">
              How it works
            </Link>
            <Link href="/compare" className="text-gray-400 hover:text-white text-sm transition-colors hidden sm:block">
              Compare
            </Link>

            <Link href="/contact" className="text-gray-400 hover:text-white text-sm transition-colors hidden sm:block">
              Contact
            </Link>

            <a
              href={GITHUB_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-white transition-colors hidden sm:block"
              title="GitHub"
              aria-label="GitHub"
            >
              <GithubIcon size={18} />
            </a>

            {status === 'loading' && (
              <div className="w-8 h-8 rounded-full bg-white/10 animate-pulse" />
            )}

            {status === 'unauthenticated' && (
              <button
                onClick={() => setShowLogin(true)}
                className="px-4 py-1.5 bg-purple-600 hover:bg-purple-500 text-white text-sm font-medium rounded-lg transition-colors"
              >
                Sign in
              </button>
            )}

            {status === 'authenticated' && session?.user && (
              <div className="flex items-center gap-3">
                <Link
                  href="/dashboard"
                  className="text-gray-300 hover:text-white text-sm transition-colors"
                >
                  My Dashboard
                </Link>
                <Link
                  href="/settings"
                  className="flex items-center gap-2 rounded-full hover:bg-white/10 pr-2 py-0.5 transition-colors"
                  title="Settings"
                >
                  {session.user.image ? (
                    <Image
                      src={session.user.image}
                      alt={session.user.name ?? ''}
                      width={32}
                      height={32}
                      className="rounded-full"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center text-white text-sm font-bold">
                      {session.user.name?.[0] ?? session.user.email?.[0] ?? '?'}
                    </div>
                  )}
                  <span className="text-gray-300 text-sm hidden sm:block">
                    {session.user.name ?? session.user.email}
                  </span>
                </Link>
                <button
                  onClick={() => signOut()}
                  className="text-gray-500 hover:text-gray-300 text-sm transition-colors"
                >
                  Sign out
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>

      {showLogin && <LoginModal onClose={() => setShowLogin(false)} />}
    </>
  )
}
