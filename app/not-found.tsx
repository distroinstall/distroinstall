import Link from 'next/link'
import { Home } from 'lucide-react'

export default function NotFound() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <p className="text-8xl font-bold text-white/90 mb-2">404</p>
        <h1 className="text-2xl font-bold text-white mb-3">Page not found</h1>
        <p className="text-gray-400 mb-8">
          The page you&apos;re looking for doesn&apos;t exist or may have been moved.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-medium rounded-lg transition-colors"
        >
          <Home size={18} />
          Back to home
        </Link>
      </div>
    </main>
  )
}
