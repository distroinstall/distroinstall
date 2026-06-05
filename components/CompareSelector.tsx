'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { ArrowLeftRight } from 'lucide-react'

export function CompareSelector({ distros }: { distros: string[] }) {
  const router = useRouter()
  const [a, setA] = useState(distros[0] ?? '')
  const [b, setB] = useState(distros[1] ?? '')

  function handleCompare() {
    if (a && b && a !== b) {
      router.push(`/compare?a=${encodeURIComponent(a)}&b=${encodeURIComponent(b)}`)
    }
  }

  const selectClass =
    'bg-slate-800 text-white border border-white/20 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-purple-400 transition-colors w-full'

  return (
    <div className="flex flex-col sm:flex-row items-center gap-4 max-w-2xl mx-auto">
      <select value={a} onChange={e => setA(e.target.value)} className={selectClass}>
        {distros.map(d => <option key={d} value={d}>{d}</option>)}
      </select>

      <div className="text-gray-400 flex-shrink-0">
        <ArrowLeftRight size={20} />
      </div>

      <select value={b} onChange={e => setB(e.target.value)} className={selectClass}>
        {distros.map(d => <option key={d} value={d}>{d}</option>)}
      </select>

      <button
        onClick={handleCompare}
        disabled={!a || !b || a === b}
        className="px-6 py-3 bg-purple-600 hover:bg-purple-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors flex-shrink-0 w-full sm:w-auto"
      >
        Compare
      </button>
    </div>
  )
}
