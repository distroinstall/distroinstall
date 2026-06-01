'use client'

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
}

type BarItem = { label: string; count: number }
type DesktopData = { desktopEnv: string; _count: { desktopEnv: number } }
type UsageData = { usageType: string; _count: { usageType: number } }

export function HorizontalBarChart({ data, yAxisWidth = 100 }: { data: BarItem[]; yAxisWidth?: number }) {
  const height = Math.max(200, data.length * 44)
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} layout="vertical" margin={{ left: 10, right: 24, top: 4, bottom: 4 }}>
        <XAxis type="number" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
        <YAxis type="category" dataKey="label" stroke="#94a3b8" fontSize={12} width={yAxisWidth} tickLine={false} axisLine={false} />
        <Tooltip contentStyle={tooltipStyle} cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
        <Bar dataKey="count" radius={[0, 6, 6, 0]}>
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
        <Tooltip contentStyle={tooltipStyle} />
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
        <Tooltip contentStyle={tooltipStyle} />
        <Legend formatter={v => <span style={{ color: '#cbd5e1', fontSize: 13 }}>{v}</span>} />
      </PieChart>
    </ResponsiveContainer>
  )
}
