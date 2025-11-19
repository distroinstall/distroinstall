import { prisma } from '@/lib/prisma'

export default async function Table() {
  const startTime = Date.now()
  const submissions = await prisma.submission.findMany({
    take: 10,
    orderBy: { timestamp: 'desc' }
  })
  const duration = Date.now() - startTime

  return (
    <div>
      <p className="text-sm text-gray-500">Fetched {submissions.length} submissions in {duration}ms</p>
      {/* Aquí mostrarás tus submissions después */}
    </div>
  )
}