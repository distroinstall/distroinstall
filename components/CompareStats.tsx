'use client'

import { Cpu, Database, Monitor, TrendingUp, Trophy, BarChart3 } from 'lucide-react'

type Props = {
  ram: number
  cpuCores: number
  cpuThreads: number
  gpu: string
  distroName: string
  ramPercentile: number
  cpuPercentile: number
  distroRank: number
  totalDistros: number
  usageType: string
  avgRam: number
  avgCpuCores: number
  isLatest?: boolean
  selector?: React.ReactNode
}

const usageLabels: Record<string, string> = {
  desktop: 'Desktop',
  programming: 'Programming',
  gaming: 'Gaming',
  server: 'Server',
  other: 'Other',
}

function PercentileBar({ value, label, icon, yourValue, avgValue, unit }: {
  value: number
  label: string
  icon: React.ReactNode
  yourValue: number
  avgValue: number
  unit: string
}) {
  const tier =
    value >= 90 ? { text: 'Top 10%',   bg: 'bg-yellow-400', textColor: 'text-yellow-300' } :
    value >= 75 ? { text: 'Top 25%',   bg: 'bg-green-400',  textColor: 'text-green-300'  } :
    value >= 50 ? { text: 'Top 50%',   bg: 'bg-blue-400',   textColor: 'text-blue-300'   } :
    value >= 25 ? { text: 'Below avg', bg: 'bg-orange-400', textColor: 'text-orange-300' } :
                  { text: 'Below avg', bg: 'bg-red-400',    textColor: 'text-red-300'    }

  const diff = yourValue - avgValue
  const diffText = diff >= 0
    ? `+${diff.toFixed(1)}${unit} above average`
    : `${diff.toFixed(1)}${unit} below average`
  const diffColor = diff >= 0 ? 'text-green-400' : 'text-red-400'

  return (
    <div className="bg-white/5 rounded-xl p-5 border border-white/10">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-gray-400">{icon}</span>
        <span className="text-gray-300 text-sm">{label}</span>
        <span className={`ml-auto text-xs font-bold px-2 py-0.5 rounded-full bg-white/10 ${tier.textColor}`}>
          {tier.text}
        </span>
      </div>
      <div className="flex items-end gap-3 mb-1">
        <span className="text-4xl font-bold text-white">{Math.round(value)}%</span>
        <span className="text-gray-400 text-sm mb-1">of users have less</span>
      </div>
      <p className={`text-xs mb-3 ${diffColor}`}>{diffText} (avg: {avgValue.toFixed(1)}{unit})</p>
      <div className="bg-white/10 rounded-full h-2 overflow-hidden">
        <div
          className={`${tier.bg} h-full rounded-full transition-all duration-700`}
          style={{ width: `${Math.max(value, 3)}%` }}
        />
      </div>
    </div>
  )
}

export function CompareStats({
  ram, cpuCores, cpuThreads, gpu, distroName,
  ramPercentile, cpuPercentile, distroRank, totalDistros, usageType,
  avgRam, avgCpuCores, isLatest = true, selector
}: Props) {
  return (
    <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 mb-8">
      <h2 className="text-2xl font-bold text-white mb-2 flex items-center gap-2.5"><BarChart3 className="text-purple-400 shrink-0" size={22} />How do you compare?</h2>
      <p className="text-gray-400 text-sm mb-4">
        Based on your {isLatest ? 'latest' : 'selected'} submission — {distroName}, {ram}GB RAM, {cpuCores}c/{cpuThreads}t
      </p>
      {selector}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <PercentileBar
          value={ramPercentile}
          label={`Your RAM: ${ram} GB`}
          icon={<Database size={16} />}
          yourValue={ram}
          avgValue={avgRam}
          unit=" GB"
        />
        <PercentileBar
          value={cpuPercentile}
          label={`Your CPU: ${cpuCores} cores`}
          icon={<Cpu size={16} />}
          yourValue={cpuCores}
          avgValue={avgCpuCores}
          unit=" cores"
        />
      </div>

      {/* Distro rank + GPU + usage */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white/5 rounded-xl p-4 border border-white/10 text-center">
          <Trophy size={20} className="text-yellow-400 mx-auto mb-2" />
          <p className="text-gray-400 text-xs mb-1">Distro ranking</p>
          <p className="text-2xl font-bold text-white">#{distroRank}</p>
          <p className="text-gray-500 text-xs">of {totalDistros} distros</p>
        </div>

        <div className="bg-white/5 rounded-xl p-4 border border-white/10 text-center">
          <Monitor size={20} className="text-pink-400 mx-auto mb-2" />
          <p className="text-gray-400 text-xs mb-1">Your GPU</p>
          <p className="text-white text-sm font-medium truncate" title={gpu}>{gpu}</p>
        </div>

        <div className="bg-white/5 rounded-xl p-4 border border-white/10 text-center">
          <TrendingUp size={20} className="text-green-400 mx-auto mb-2" />
          <p className="text-gray-400 text-xs mb-1">Usage type</p>
          <p className="text-white font-medium">{usageLabels[usageType] ?? usageType}</p>
        </div>
      </div>
    </div>
  )
}
