'use client'

import { useRouter } from 'next/navigation'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  AreaChart,
  Area,
} from 'recharts'

const PALETTE = [
  '#6366f1', '#8b5cf6', '#a855f7', '#c084fc',
  '#e879f9', '#60a5fa', '#34d399', '#fb923c',
  '#f472b6', '#38bdf8',
]

const tooltipStyle = {
  backgroundColor: '#0f172a',
  border: '1px solid rgba(255,255,255,0.15)',
  borderRadius: '8px',
  color: '#f1f5f9',
  boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
}

// Recharts renders the tooltip label and items with dark defaults, which are
// invisible on our dark card. Force light colors.
const tooltipLabelStyle = { color: '#e2e8f0', fontWeight: 600, marginBottom: 4 }
const tooltipItemStyle = { color: '#cbd5e1' }

type BarItem = { label: string; count: number }
type DesktopData = { desktopEnv: string; _count: { desktopEnv: number } }
type UsageData = { usageType: string; _count: { usageType: number } }

export function HorizontalBarChart({
  data,
  yAxisWidth = 100,
  linkBase,
}: {
  data: BarItem[]
  yAxisWidth?: number
  // When set, clicking a bar navigates to `${linkBase}/${encodeURIComponent(label)}`.
  linkBase?: string
}) {
  const router = useRouter()
  const height = Math.max(200, data.length * 44)
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} layout="vertical" margin={{ left: 10, right: 24, top: 4, bottom: 4 }}>
        <XAxis type="number" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
        <YAxis type="category" dataKey="label" stroke="#94a3b8" fontSize={12} width={yAxisWidth} tickLine={false} axisLine={false} />
        <Tooltip contentStyle={tooltipStyle} labelStyle={tooltipLabelStyle} itemStyle={tooltipItemStyle} cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
        <Bar
          dataKey="count"
          radius={[0, 6, 6, 0]}
          cursor={linkBase ? 'pointer' : undefined}
          onClick={
            linkBase
              ? (state) => {
                  const label = (state as unknown as { payload?: BarItem }).payload?.label
                  if (label) router.push(`${linkBase}/${encodeURIComponent(label)}`)
                }
              : undefined
          }
        >
          {data.map((_, i) => <Cell key={i} fill={PALETTE[i % PALETTE.length]} />)}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}

export function DesktopPieChart({ data }: { data: DesktopData[] }) {
  const items = data.map(d => ({ name: d.desktopEnv, value: d._count.desktopEnv }))
  return (
    <ResponsiveContainer width="100%" height={320}>
      <PieChart>
        <Pie data={items} dataKey="value" nameKey="name" cx="50%" cy="45%" innerRadius={70} outerRadius={110}>
          {items.map((_, i) => <Cell key={i} fill={PALETTE[i % PALETTE.length]} />)}
        </Pie>
        <Tooltip contentStyle={tooltipStyle} labelStyle={tooltipLabelStyle} itemStyle={tooltipItemStyle} />
        <Legend formatter={v => <span style={{ color: '#cbd5e1', fontSize: 13 }}>{v}</span>} />
      </PieChart>
    </ResponsiveContainer>
  )
}

export function UsagePieChart({ data, labels }: { data: UsageData[]; labels: Record<string, string> }) {
  const items = data.map(d => ({ name: labels[d.usageType] || d.usageType, value: d._count.usageType }))
  return (
    <ResponsiveContainer width="100%" height={320}>
      <PieChart>
        <Pie data={items} dataKey="value" nameKey="name" cx="50%" cy="45%" outerRadius={100}>
          {items.map((_, i) => <Cell key={i} fill={PALETTE[i % PALETTE.length]} />)}
        </Pie>
        <Tooltip contentStyle={tooltipStyle} labelStyle={tooltipLabelStyle} itemStyle={tooltipItemStyle} />
        <Legend formatter={v => <span style={{ color: '#cbd5e1', fontSize: 13 }}>{v}</span>} />
      </PieChart>
    </ResponsiveContainer>
  )
}

type GrowthPoint = { day: string; count: number }

export function GrowthLineChart({ data }: { data: GrowthPoint[] }) {
  return (
    <ResponsiveContainer width="100%" height={180}>
      <AreaChart data={data} margin={{ left: 0, right: 16, top: 8, bottom: 0 }}>
        <defs>
          <linearGradient id="growthGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.4} />
            <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
          </linearGradient>
        </defs>
        <XAxis dataKey="day" stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
        <YAxis stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} width={28} allowDecimals={false} />
        <Tooltip contentStyle={tooltipStyle} labelStyle={tooltipLabelStyle} itemStyle={tooltipItemStyle} cursor={{ stroke: 'rgba(255,255,255,0.1)' }} />
        <Area type="monotone" dataKey="count" stroke="#8b5cf6" strokeWidth={2} fill="url(#growthGrad)" dot={false} activeDot={{ r: 4, fill: '#8b5cf6' }} />
      </AreaChart>
    </ResponsiveContainer>
  )
}
