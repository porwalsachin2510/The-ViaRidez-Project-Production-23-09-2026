import { Schema, model, models, type InferSchemaType } from 'mongoose'
import { seoSchema, auditFields, statusField } from '@/lib/db/shared-schema'

const industrySchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, index: true },
    icon: { type: String, default: 'building-2' },
    excerpt: { type: String, default: '', maxlength: 320 },
    heroTitle: { type: String, default: '' },
    heroImage: { type: String, default: null },
    body: { type: String, default: '' },
    challenges: { type: [String], default: [] },
    solutions: { type: [String], default: [] },
    order: { type: Number, default: 0 },
    featured: { type: Boolean, default: false },
    seo: { type: seoSchema, default: () => ({}) },
    ...statusField,
  },
  { timestamps: true },
)
industrySchema.add(auditFields)

export type IndustryDoc = InferSchemaType<typeof industrySchema>
export const Industry = models.Industry || model('Industry', industrySchema)
export default Industry
