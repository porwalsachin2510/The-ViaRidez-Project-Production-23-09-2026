import { Schema, model, models } from 'mongoose'

const rateLimitSchema = new Schema(
  {
    key: { type: String, required: true, unique: true, index: true },
    count: { type: Number, default: 0 },
    windowStartedAt: { type: Date, required: true },
    expiresAt: { type: Date, required: true, index: { expires: 0 } },
  },
  { timestamps: true },
)

const idempotencyKeySchema = new Schema(
  {
    scope: { type: String, required: true },
    key: { type: String, required: true },
    fingerprint: { type: String, required: true },
    response: { type: Schema.Types.Mixed, default: null },
    status: { type: String, enum: ['processing', 'completed'], default: 'processing' },
    expiresAt: { type: Date, required: true, index: { expires: 0 } },
  },
  { timestamps: true },
)
idempotencyKeySchema.index({ scope: 1, key: 1 }, { unique: true })

const adminNotificationSchema = new Schema(
  {
    kind: { type: String, enum: ['contact', 'quote', 'demo', 'application', 'partner', 'subscriber', 'comment'], required: true, index: true },
    title: { type: String, required: true },
    detail: { type: String, default: '' },
    href: { type: String, default: '/admin' },
    readAt: { type: Date, default: null, index: true },
  },
  { timestamps: true },
)

const deliveryEventSchema = new Schema(
  {
    kind: { type: String, enum: ['email', 'crm'], required: true, index: true },
    dedupeKey: { type: String, required: true, unique: true, index: true },
    provider: { type: String, default: '' },
    status: { type: String, enum: ['pending', 'sent', 'failed'], default: 'pending', index: true },
    attempts: { type: Number, default: 0 },
    nextRetryAt: { type: Date, default: null },
    payload: { type: Schema.Types.Mixed, default: {} },
    response: { type: String, default: '' },
    error: { type: String, default: '' },
  },
  { timestamps: true },
)

deliveryEventSchema.index({ nextRetryAt: 1 }, { expireAfterSeconds: 60 * 60 * 24 * 30 })

export const RateLimit = models.RateLimit || model('RateLimit', rateLimitSchema)
export const IdempotencyKey = models.IdempotencyKey || model('IdempotencyKey', idempotencyKeySchema)
export const DeliveryEvent = models.DeliveryEvent || model('DeliveryEvent', deliveryEventSchema)
export const AdminNotification = models.AdminNotification || model('AdminNotification', adminNotificationSchema)
