'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useSession, signOut } from 'next-auth/react'
import Image from 'next/image'
import { Menu, X, LogOut } from 'lucide-react'
import { LoginModal } from './LoginModal'
import { Logo } from './Logo'
import { GithubIcon } from './GithubIcon'
import { GITHUB_URL } from '@/lib/utils'

export function Navbar() {
  const { data: session, status } = useSession()
  const [showLogin, setShowLogin] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  const closeMenu = () => setMenuOpen(false)

  const Avatar = ({ size = 32 }: { size?: number }) =>
    session?.user?.image ? (
      <Image
        src={session.user.image}
        alt={session.user.name ?? ''}
        width={size}
        height={size}
        className="rounded-full"
      />
    ) : (
      <div
        className="rounded-full bg-purple-600 flex items-center justify-center text-white text-sm font-bold"
        style={{ width: size, height: size }}
      >
        {session?.user?.name?.[0] ?? session?.user?.email?.[0] ?? '?'}
      </div>
    )

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-40 bg-slate-900/80 backdrop-blur-lg border-b border-white/10">
        <div className="container mx-auto px-4 h-14 flex items-center justify-between">

          <Link href="/" onClick={closeMenu} className="flex items-center gap-2 text-white font-bold text-lg shrink-0">
            <Logo size={26} />
            DistroInstall
          </Link>

          {/* Desktop nav */}
          <div className="hidden sm:flex items-center gap-3">
            <Link href="/submit" className="text-white hover:text-purple-300 text-sm font-medium transition-colors">Submit</Link>
            <Link href="/distros" className="text-gray-400 hover:text-white text-sm transition-colors">Distros</Link>
            <Link href="/compare" className="text-gray-400 hover:text-white text-sm transition-colors">Compare</Link>
            <Link href="/how-it-works" className="text-gray-400 hover:text-white text-sm transition-colors">How it works</Link>
            <Link href="/contact" className="text-gray-400 hover:text-white text-sm transition-colors">Contact</Link>
            <a
              href={GITHUB_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-white transition-colors"
              title="GitHub"
              aria-label="GitHub"
            >
              <GithubIcon size={18} />
            </a>

            {status === 'loading' && <div className="w-8 h-8 rounded-full bg-white/10 animate-pulse" />}

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
                <Link href="/dashboard" className="text-gray-300 hover:text-white text-sm transition-colors">My Dashboard</Link>
                <Link
                  href="/dashboard"
                  className="flex items-center gap-2 rounded-full hover:bg-white/10 pr-2 py-0.5 transition-colors"
                  title="My Dashboard"
                >
                  <Avatar />
                  <span className="text-gray-300 text-sm">{session.user.name ?? session.user.email}</span>
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

          {/* Mobile: avatar (if signed in) + hamburger */}
          <div className="flex items-center gap-2 sm:hidden">
            {status === 'authenticated' && session?.user && (
              <Link href="/dashboard" onClick={closeMenu} title="My Dashboard">
                <Avatar size={30} />
              </Link>
            )}
            <button
              onClick={() => setMenuOpen(o => !o)}
              className="text-gray-300 hover:text-white p-1 -mr-1 transition-colors"
              aria-label="Menu"
              aria-expanded={menuOpen}
            >
              {menuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile dropdown */}
        {menuOpen && (
          <div className="sm:hidden border-t border-white/10 bg-slate-900/95 backdrop-blur-lg">
            <div className="container mx-auto px-4 py-3 flex flex-col">
              {status === 'authenticated' && session?.user && (
                <>
                  <MobileLink href="/dashboard" onClick={closeMenu}>My Dashboard</MobileLink>
                  <MobileLink href="/settings" onClick={closeMenu}>Settings</MobileLink>
                  <div className="my-1 border-t border-white/10" />
                </>
              )}
              <MobileLink href="/submit" onClick={closeMenu}>Submit</MobileLink>
              <MobileLink href="/distros" onClick={closeMenu}>Distros</MobileLink>
              <MobileLink href="/compare" onClick={closeMenu}>Compare</MobileLink>
              <MobileLink href="/how-it-works" onClick={closeMenu}>How it works</MobileLink>
              <MobileLink href="/contact" onClick={closeMenu}>Contact</MobileLink>
              <a
                href={GITHUB_URL}
                target="_blank"
                rel="noopener noreferrer"
                onClick={closeMenu}
                className="flex items-center gap-2 py-2.5 text-gray-300 hover:text-white transition-colors"
              >
                <GithubIcon size={16} /> GitHub
              </a>

              <div className="my-1 border-t border-white/10" />

              {status === 'unauthenticated' && (
                <button
                  onClick={() => { setShowLogin(true); closeMenu() }}
                  className="mt-1 px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white text-sm font-medium rounded-lg transition-colors"
                >
                  Sign in
                </button>
              )}
              {status === 'authenticated' && (
                <button
                  onClick={() => { closeMenu(); signOut() }}
                  className="flex items-center gap-2 py-2.5 text-gray-400 hover:text-white transition-colors"
                >
                  <LogOut size={16} /> Sign out
                </button>
              )}
            </div>
          </div>
        )}
      </nav>

      {showLogin && <LoginModal onClose={() => setShowLogin(false)} />}
    </>
  )
}

function MobileLink({ href, onClick, children }: { href: string; onClick: () => void; children: React.ReactNode }) {
  return (
    <Link href={href} onClick={onClick} className="py-2.5 text-gray-300 hover:text-white transition-colors">
      {children}
    </Link>
  )
}
