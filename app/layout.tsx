import './globals.css'
import Link from 'next/link'
import { Inter } from 'next/font/google'
import AuthProvider from '@/components/SessionProvider'
import { Navbar } from '@/components/Navbar'
import { Logo } from '@/components/Logo'
import { GithubIcon } from '@/components/GithubIcon'
import { GITHUB_URL } from '@/lib/utils'

export const metadata = {
  metadataBase: new URL('https://distroinstall.com'),
  title: 'DistroInstall — Real stats from real Linux users',
  description:
    'Submit your Linux setup and see how it compares with the community. Real hardware stats, distro rankings, and more.',
}

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
  display: 'swap',
})

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.variable}>
        <AuthProvider>
          <Navbar />
          <div className="pt-14">{children}</div>
          <footer className="border-t border-white/10 bg-slate-900/80 backdrop-blur-lg">
            <div className="container mx-auto px-4 h-14 flex items-center justify-between">
              <Link href="/" className="flex items-center gap-2 text-white font-bold text-lg">
                <Logo size={24} />
                DistroInstall
              </Link>
              <div className="flex items-center gap-6 text-sm">
                <Link href="/how-it-works" className="text-gray-400 hover:text-white transition-colors">How it works</Link>
                <Link href="/compare" className="text-gray-400 hover:text-white transition-colors">Compare</Link>
                <Link href="/contact" className="text-gray-400 hover:text-white transition-colors">Contact</Link>
                <Link href="/privacy" className="text-gray-400 hover:text-white transition-colors">Privacy Policy</Link>
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
                <span className="text-gray-500 text-xs">© {new Date().getFullYear()}</span>
              </div>
            </div>
          </footer>
        </AuthProvider>
      </body>
    </html>
  )
}
