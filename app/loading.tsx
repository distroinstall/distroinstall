import { Logo } from '@/components/Logo'

export default function Loading() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center px-4">
      <div className="text-center">
        <div className="flex justify-center mb-4 animate-pulse">
          <Logo size={56} />
        </div>
        <p className="text-gray-400 text-sm animate-pulse">Loading stats…</p>
      </div>
    </main>
  )
}
