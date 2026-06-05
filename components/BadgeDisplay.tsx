import { BADGE_META, type BadgeType } from '@/lib/badges'

type BadgeItem = { badgeType: string; earnedAt: Date }

export function BadgeDisplay({
  badges,
  showLocked = false,
}: {
  badges: BadgeItem[]
  showLocked?: boolean
}) {
  const earned = new Set(badges.map(b => b.badgeType))

  // Public profile (showLocked=false) only renders earned badges.
  if (!showLocked) {
    if (badges.length === 0) {
      return (
        <p className="text-gray-500 text-sm text-center py-6">
          No badges yet — submit more data to unlock them
        </p>
      )
    }
    return (
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {badges.map(b => {
          const meta = BADGE_META[b.badgeType as BadgeType]
          if (!meta) return null
          return <Card key={b.badgeType} meta={meta} unlocked />
        })}
      </div>
    )
  }

  // Dashboard: render every badge, greying out the ones not yet earned.
  const allTypes = Object.keys(BADGE_META) as BadgeType[]
  return (
    <div>
      <p className="text-gray-400 text-sm mb-4">
        {earned.size} of {allTypes.length} unlocked
      </p>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {allTypes.map(type => (
          <Card key={type} meta={BADGE_META[type]} unlocked={earned.has(type)} />
        ))}
      </div>
    </div>
  )
}

function Card({ meta, unlocked }: { meta: (typeof BADGE_META)[BadgeType]; unlocked: boolean }) {
  if (!unlocked) {
    return (
      <div className="flex items-center gap-3 rounded-xl px-4 py-3 border border-white/10 bg-white/5 opacity-60">
        <span className="text-2xl flex-shrink-0 grayscale">🔒</span>
        <div className="min-w-0">
          <p className="font-semibold text-sm leading-tight text-gray-300">{meta.label}</p>
          <p className="text-xs text-gray-500 leading-tight mt-0.5">{meta.description}</p>
        </div>
      </div>
    )
  }
  return (
    <div className={`flex items-center gap-3 rounded-xl px-4 py-3 border ${meta.colorClass}`}>
      <span className="text-2xl flex-shrink-0">{meta.emoji}</span>
      <div className="min-w-0">
        <p className="font-semibold text-sm leading-tight">{meta.label}</p>
        <p className="text-xs opacity-70 leading-tight mt-0.5">{meta.description}</p>
      </div>
    </div>
  )
}
