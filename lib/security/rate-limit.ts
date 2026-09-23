import 'server-only'
import { connectToDatabase } from '@/lib/db/mongoose'
import { RateLimit } from '@/models'

export async function enforceRateLimit(
  key: string,
  options: { limit: number; windowMs: number },
): Promise<{ allowed: boolean; retryAfterSeconds: number }> {
  await connectToDatabase()
  const now = new Date()
  const existing = await RateLimit.findOne({ key }).lean()
  if (!existing || now.getTime() - new Date(existing.windowStartedAt).getTime() >= options.windowMs) {
    await RateLimit.findOneAndUpdate(
      { key },
      { $set: { count: 1, windowStartedAt: now, expiresAt: new Date(now.getTime() + options.windowMs) } },
      { upsert: true, returnDocument: "after", setDefaultsOnInsert: true },
    )
    return { allowed: true, retryAfterSeconds: Math.ceil(options.windowMs / 1000) }
  }
  if (existing.count >= options.limit) {
    return { allowed: false, retryAfterSeconds: Math.max(1, Math.ceil((new Date(existing.expiresAt).getTime() - now.getTime()) / 1000)) }
  }
  await RateLimit.updateOne({ key }, { $inc: { count: 1 } })
  return { allowed: true, retryAfterSeconds: Math.ceil((new Date(existing.expiresAt).getTime() - now.getTime()) / 1000) }
}
