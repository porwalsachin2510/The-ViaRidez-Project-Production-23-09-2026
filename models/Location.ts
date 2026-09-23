import { Schema, model, models, type InferSchemaType } from 'mongoose'
import { seoSchema, auditFields, statusField } from '@/lib/db/shared-schema'

const locationSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, index: true },
    type: {
      type: String,
      enum: ['country', 'city', 'region'],
      default: 'city',
      index: true,
    },
    countryCode: { type: String, default: '' },
    excerpt: { type: String, default: '', maxlength: 320 },
    heroTitle: { type: String, default: '' },
    heroImage: { type: String, default: null },
    body: { type: String, default: '' },
    address: { type: String, default: '' },
    phone: { type: String, default: '' },
    email: { type: String, default: '' },
    coordinates: {
      lat: { type: Number, default: null },
      lng: { type: Number, default: null },
    },
    highlights: { type: [String], default: [] },
    order: { type: Number, default: 0 },
    isPrimary: { type: Boolean, default: false },
    seo: { type: seoSchema, default: () => ({}) },
    ...statusField,
  },
  { timestamps: true },
)
locationSchema.add(auditFields)

const freeZoneSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    abbreviation: { type: String, default: '' },
    slug: { type: String, required: true, unique: true, index: true },
    excerpt: { type: String, default: '', maxlength: 320 },
    heroTitle: { type: String, default: '' },
    heroImage: { type: String, default: null },
    body: { type: String, default: '' },
    location: { type: Schema.Types.ObjectId, ref: 'Location', default: null },
    features: { type: [String], default: [] },
    routes: { type: [String], default: [] },
    order: { type: Number, default: 0 },
    seo: { type: seoSchema, default: () => ({}) },
    ...statusField,
  },
  { timestamps: true },
)
freeZoneSchema.add(auditFields)

export type LocationDoc = InferSchemaType<typeof locationSchema>
export type FreeZoneDoc = InferSchemaType<typeof freeZoneSchema>

export const Location = models.Location || model('Location', locationSchema)
export const FreeZone = models.FreeZone || model('FreeZone', freeZoneSchema)
