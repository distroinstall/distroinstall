// Lightweight in-memory fixed-window rate limiter.
// On Vercel a warm serverless instance keeps this map between invocations,
// so a single client hammering the endpoint hits the same instance and gets
// throttled. It is not a distributed guarantee — for that you'd swap in
// Upstash/Redis — but it stops the obvious abuse (a loop inflating stats)
// without adding any infrastructure.

type Bucket = { count: number; resetAt: number }

const buckets = new Map<string, Bucket>()

// Periodically drop expired buckets so the map can't grow unbounded.
function sweep(now: number) {
  if (buckets.size < 5000) return
  buckets.forEach((b, key) => {
    if (b.resetAt <= now) buckets.delete(key)
  })
}

export type RateLimitResult = { ok: boolean; remaining: number; retryAfter: number }

/**
 * @param key      Identifier to bucket on (e.g. client IP).
 * @param limit    Max requests allowed within the window.
 * @param windowMs Window length in milliseconds.
 */
export function rateLimit(key: string, limit: number, windowMs: number): RateLimitResult {
  const now = Date.now()
  sweep(now)

  const existing = buckets.get(key)
  if (!existing || existing.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs })
    return { ok: true, remaining: limit - 1, retryAfter: 0 }
  }

  if (existing.count >= limit) {
    return { ok: false, remaining: 0, retryAfter: Math.ceil((existing.resetAt - now) / 1000) }
  }

  existing.count++
  return { ok: true, remaining: limit - existing.count, retryAfter: 0 }
}

/** Best-effort client IP from common proxy headers (Vercel sets x-forwarded-for). */
export function getClientIp(request: Request): string {
  const fwd = request.headers.get('x-forwarded-for')
  if (fwd) return fwd.split(',')[0].trim()
  return request.headers.get('x-real-ip') ?? 'unknown'
}
