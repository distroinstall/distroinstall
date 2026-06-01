'use client'

import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

const usageOptions = [
  { value: null,          label: 'All' },
  { value: 'desktop',     label: 'Desktop' },
  { value: 'programming', label: 'Programming' },
  { value: 'gaming',      label: 'Gaming' },
  { value: 'server',      label: 'Server' },
]

function Btn({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
        active
          ? 'bg-purple-500 text-white'
          : 'bg-white/10 text-gray-300 hover:bg-white/20'
      }`}
    >
      {children}
    </button>
  )
}

function FilterBarInner() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const virtualParam = searchParams.get('virtual')
  const usageParam = searchParams.get('usage')
  const hasFilters = virtualParam !== null || usageParam !== null

  const setParam = (key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value === null) {
      params.delete(key)
    } else if (params.get(key) === value) {
      params.delete(key)
    } else {
      params.set(key, value)
    }
    router.push(`${pathname}?${params.toString()}`)
  }

  const clearAll = () => router.push(pathname)

  return (
    <div className="bg-white/5 backdrop-blur-lg rounded-xl p-4 border border-white/10 mb-8">
      <div className="flex flex-wrap gap-x-8 gap-y-3 items-center">

        <div className="flex items-center gap-2">
          <span className="text-gray-400 text-sm whitespace-nowrap">Machine:</span>
          <div className="flex gap-1">
            <Btn active={virtualParam === null} onClick={() => setParam('virtual', null)}>All</Btn>
            <Btn active={virtualParam === 'false'} onClick={() => setParam('virtual', 'false')}>Physical</Btn>
            <Btn active={virtualParam === 'true'} onClick={() => setParam('virtual', 'true')}>Virtual</Btn>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-gray-400 text-sm whitespace-nowrap">Usage:</span>
          <div className="flex flex-wrap gap-1">
            {usageOptions.map(({ value, label }) => (
              <Btn
                key={label}
                active={usageParam === value}
                onClick={() => setParam('usage', value)}
              >
                {label}
              </Btn>
            ))}
          </div>
        </div>

        {hasFilters && (
          <button
            onClick={clearAll}
            className="text-xs text-gray-500 hover:text-gray-300 transition-colors ml-auto"
          >
            Clear filters ✕
          </button>
        )}
      </div>
    </div>
  )
}

export function FilterBar() {
  return (
    <Suspense fallback={<div className="h-16 mb-8" />}>
      <FilterBarInner />
    </Suspense>
  )
}
