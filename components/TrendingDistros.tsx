import Link from 'next/link'

export type TrendingItem = {
  distroName: string
  thisWeek: number
  prevWeek: number
  delta: number
}

export function TrendingDistros({ data }: { data: TrendingItem[] }) {
  if (data.length === 0) {
    return <p className="text-gray-400 text-center py-8">Not enough data yet — check back next week</p>
  }

  return (
    <div className="space-y-3">
      {data.map((item, i) => {
        const isNew = item.prevWeek === 0
        const isUp = item.delta > 0
        const isDown = item.delta < 0
        const pct = !isNew && item.prevWeek > 0
          ? Math.round((item.delta / item.prevWeek) * 100)
          : null

        return (
          <div key={item.distroName} className="flex items-center gap-3 bg-white/5 rounded-lg px-4 py-3 hover:bg-white/10 transition-colors">
            <span className="text-gray-500 text-sm w-5 text-center font-mono">{i + 1}</span>
            <Link
              href={`/distro/${encodeURIComponent(item.distroName)}`}
              className="text-white font-semibold flex-1 hover:text-purple-300 transition-colors"
            >
              {item.distroName}
            </Link>
            <span className="text-gray-400 text-sm">{item.thisWeek} this week</span>
            <div className={`flex items-center gap-1 text-sm font-mono min-w-[80px] justify-end ${
              isUp ? 'text-green-400' : isDown ? 'text-red-400' : 'text-gray-500'
            }`}>
              {isNew ? (
                <span className="text-xs bg-green-500/20 text-green-300 px-2 py-0.5 rounded-full">NEW</span>
              ) : (
                <>
                  <span className="text-base">{isUp ? '↑' : isDown ? '↓' : '→'}</span>
                  <span>{isUp ? '+' : ''}{item.delta}</span>
                  {pct !== null && (
                    <span className="text-gray-500 text-xs ml-1">
                      ({pct > 0 ? '+' : ''}{pct}%)
                    </span>
                  )}
                </>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
