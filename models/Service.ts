import { Schema, model, models, type InferSchemaType } from 'mongoose'
import { seoSchema, auditFields, statusField } from '@/lib/db/shared-schema'

const featureSchema = new Schema(
  {
    icon: { type: String, default: 'circle-check' },
    title: { type: String, required: true },
    description: { type: String, default: '' },
  },
  { _id: false },
)

const serviceSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, index: true },
    parent: { type: Schema.Types.ObjectId, ref: 'Service', default: null, index: true },
    category: {
      type: String,
      enum: ['corporate', 'specialized', 'free-zone', 'mice', 'general'],
      default: 'general',
      index: true,
    },
    icon: { type: String, default: 'bus' },
    excerpt: { type: String, default: '', maxlength: 320 },
    heroTitle: { type: String, default: '' },
    heroSubtitle: { type: String, default: '' },
    heroImage: { type: String, default: null },
    body: { type: String, default: '' },
    features: { type: [featureSchema], default: [] },
    benefits: { type: [String], default: [] },
    order: { type: Number, default: 0 },
    featured: { type: Boolean, default: false },
    seo: { type: seoSchema, default: () => ({}) },
    ...statusField,
  },
  { timestamps: true },
)

serviceSchema.add(auditFields)

export type ServiceDoc = InferSchemaType<typeof serviceSchema>
export const Service = models.Service || model('Service', serviceSchema)
export default Service
