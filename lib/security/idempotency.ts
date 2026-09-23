import 'server-only'
import { connectToDatabase } from '@/lib/db/mongoose'
import { IdempotencyKey } from '@/models'
import { fingerprint } from './request'

export async function reserveIdempotency(scope: string, key: string, payload: unknown) {
  await connectToDatabase()
  const safeKey = key.trim().slice(0, 180)
  const bodyFingerprint = fingerprint(scope, payload)
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24)
  try {
    const record = await IdempotencyKey.create({ scope, key: safeKey, fingerprint: bodyFingerprint, expiresAt })
    return { kind: 'new' as const, record }
  } catch (error: unknown) {
    if ((error as { code?: number })?.code !== 11000) throw error
    const record = await IdempotencyKey.findOne({ scope, key: safeKey }).lean()
    if (!record || record.fingerprint !== bodyFingerprint) return { kind: 'conflict' as const }
    if (record.status === 'completed') return { kind: 'replay' as const, response: record.response }
    return { kind: 'processing' as const }
  }
}

export async function completeIdempotency(scope: string, key: string, response: unknown) {
  await IdempotencyKey.updateOne({ scope, key: key.trim().slice(0, 180) }, { $set: { status: 'completed', response } })
}
