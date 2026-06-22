import { ImageResponse } from 'next/og'
import { prisma } from '@/lib/prisma'

export const runtime = 'nodejs'
export const revalidate = 3600
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'
export const alt = 'DistroInstall — Linux hardware stats'

export default async function Image({ params }: { params: { name: string } }) {
  const distroName = decodeURIComponent(params.name)

  const [count, agg, desktop] = await Promise.all([
    prisma.submission.count({ where: { distroName } }),
    prisma.submission.aggregate({ where: { distroName }, _avg: { ram: true } }),
    prisma.submission.groupBy({
      by: ['desktopEnv'],
      where: { distroName },
      _count: { desktopEnv: true },
      orderBy: { _count: { desktopEnv: 'desc' } },
      take: 1,
    }),
  ])

  const avgRam = agg._avg.ram
  const topDesktop = desktop[0]?.desktopEnv

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '70px',
          background: 'linear-gradient(135deg, #0f172a 0%, #4c1d95 55%, #0f172a 100%)',
          color: 'white',
          fontFamily: 'sans-serif',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', fontSize: 40, fontWeight: 700, color: '#c4b5fd' }}>
          {'>_'}&nbsp;DistroInstall
        </div>

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', fontSize: 80, fontWeight: 800, lineHeight: 1.05 }}>{distroName}</div>
          <div style={{ display: 'flex', fontSize: 34, color: '#cbd5e1', marginTop: 22 }}>
            {count} submission{count !== 1 ? 's' : ''} from real Linux users
          </div>
        </div>

        <div style={{ display: 'flex', gap: '52px', fontSize: 30, color: '#e2e8f0' }}>
          {avgRam != null && <div style={{ display: 'flex' }}>{avgRam.toFixed(1)} GB avg RAM</div>}
          {topDesktop && <div style={{ display: 'flex' }}>Top desktop: {topDesktop}</div>}
        </div>
      </div>
    ),
    { ...size }
  )
}
