export type BadgeType =
  | 'early_adopter'
  | 'power_user'
  | 'distro_hopper'
  | 'ram_beast'
  | 'arch_enjoyer'
  | 'minimalist'

export type BadgeMeta = {
  label: string
  description: string
  emoji: string
  colorClass: string
}

export const BADGE_META: Record<BadgeType, BadgeMeta> = {
  early_adopter: {
    label: 'Early Adopter',
    description: 'One of the first 100 users on DistroInstall',
    emoji: '🌱',
    colorClass: 'bg-green-500/10 border-green-400/30 text-green-300',
  },
  power_user: {
    label: 'Power User',
    description: '5 or more submissions',
    emoji: '⚡',
    colorClass: 'bg-yellow-500/10 border-yellow-400/30 text-yellow-300',
  },
  distro_hopper: {
    label: 'Distro Hopper',
    description: '3 or more different distros used',
    emoji: '🦘',
    colorClass: 'bg-blue-500/10 border-blue-400/30 text-blue-300',
  },
  ram_beast: {
    label: 'RAM Beast',
    description: 'Submitted a machine with 32 GB RAM or more',
    emoji: '💾',
    colorClass: 'bg-purple-500/10 border-purple-400/30 text-purple-300',
  },
  arch_enjoyer: {
    label: 'Arch Enjoyer',
    description: 'Runs an Arch-based distribution',
    emoji: '🎯',
    colorClass: 'bg-slate-500/10 border-slate-400/30 text-slate-300',
  },
  minimalist: {
    label: 'Minimalist',
    description: 'Runs Linux on 4 GB RAM or less',
    emoji: '🪶',
    colorClass: 'bg-teal-500/10 border-teal-400/30 text-teal-300',
  },
}

const ARCH_BASED = new Set([
  'Arch Linux', 'Manjaro', 'EndeavourOS', 'Garuda Linux',
  'ArcoLinux', 'BlackArch', 'CachyOS', 'Artix Linux',
])

export function computeEarnedBadges(params: {
  submissions: { distroName: string; ram: number }[]
  userRank: number
}): BadgeType[] {
  const { submissions, userRank } = params
  const earned: BadgeType[] = []

  if (userRank <= 100) earned.push('early_adopter')
  if (submissions.length >= 5) earned.push('power_user')

  const uniqueDistros = new Set(submissions.map(s => s.distroName))
  if (uniqueDistros.size >= 3) earned.push('distro_hopper')

  if (submissions.some(s => s.ram >= 32)) earned.push('ram_beast')
  if (submissions.some(s => ARCH_BASED.has(s.distroName))) earned.push('arch_enjoyer')
  if (submissions.some(s => s.ram <= 4)) earned.push('minimalist')

  return earned
}
