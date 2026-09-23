import mongoose, { Schema, model, models, type InferSchemaType } from 'mongoose'
import { auditFields } from '@/lib/db/shared-schema'

export const ROLES = ['admin', 'editor', 'content_writer', 'seo_manager'] as const
export type UserRole = (typeof ROLES)[number]

const userSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    passwordHash: { type: String, required: true, select: false },
    role: { type: String, enum: ROLES, default: 'content_writer', index: true },
    avatar: { type: String, default: null },
    isActive: { type: Boolean, default: true },
    lastLoginAt: { type: Date, default: null },
  },
  { timestamps: true },
)

userSchema.add(auditFields)

export type UserDoc = InferSchemaType<typeof userSchema>

export const User = models.User || model('User', userSchema)
export default User
