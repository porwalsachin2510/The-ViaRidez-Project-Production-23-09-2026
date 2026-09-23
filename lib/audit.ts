import 'server-only'
import { connectToDatabase } from '@/lib/db/mongoose'
import { AuditLog } from '@/models'
import { boundedText, requestMetadata } from '@/lib/security/request'

export async function recordAuditEvent(input: {
  user?: { id?: string; name?: string | null } | null
  action: string
  entity?: string
  entityId?: string
  meta?: Record<string, unknown>
}) {
  try {
    await connectToDatabase()
    const meta = await requestMetadata().catch(() => ({ ipHash: '', userAgentHash: '', referrer: '', origin: '' }))
    await AuditLog.create({
      user: input.user?.id || null,
      userName: boundedText(input.user?.name, 120),
      action: boundedText(input.action, 80),
      entity: boundedText(input.entity, 80),
      entityId: boundedText(input.entityId, 120),
      meta: { ...input.meta, ipHash: meta.ipHash, userAgentHash: meta.userAgentHash, referrer: meta.referrer },
      ip: meta.ipHash,
    })
  } catch {
    // Audit logging must never break the business mutation.
  }
}
