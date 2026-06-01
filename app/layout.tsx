import './globals.css'
import { Inter } from 'next/font/google'
import AuthProvider from '@/components/SessionProvider'
import { Navbar } from '@/components/Navbar'

export const metadata = {
  metadataBase: new URL('https://distroinstall.vercel.app'),
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
        </AuthProvider>
      </body>
    </html>
  )
}
