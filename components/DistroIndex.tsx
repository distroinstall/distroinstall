'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { Search } from 'lucide-react'

type Distro = { name: string; count: number }

export function DistroIndex({ distros }: { distros: Distro[] }) {
  const [query, setQuery] = useState('')

  // Seed the search from a ?q= param (e.g. Google's sitelinks search box),
  // read client-side so the page itself stays statically cacheable.
  useEffect(() => {
    const q = new URLSearchParams(window.location.search).get('q')
    if (q) setQuery(q)
  }, [])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return distros
    return distros.filter(d => d.name.toLowerCase().includes(q))
  }, [query, distros])

  return (
    <div>
      <div className="relative mb-6">
        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Search distributions…"
          className="w-full bg-black/30 border border-white/20 rounded-lg pl-11 pr-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-purple-400"
          autoComplete="off"
        />
      </div>

      <p className="text-gray-500 text-sm mb-4">
        {filtered.length} {filtered.length === 1 ? 'distribution' : 'distributions'}
        {query && ` matching “${query}”`}
      </p>

      {filtered.length === 0 ? (
        <p className="text-gray-400 text-center py-16">No distributions match your search.</p>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filtered.map(d => (
            <Link
              key={d.name}
              href={`/distro/${encodeURIComponent(d.name)}`}
              className="flex items-center justify-between gap-3 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/30 rounded-xl px-4 py-3 transition-colors group"
            >
              <span className="text-white font-medium truncate group-hover:text-purple-300 transition-colors">
                {d.name}
              </span>
              <span className="shrink-0 text-xs text-gray-400 bg-white/10 rounded-full px-2.5 py-1">
                {d.count}
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
