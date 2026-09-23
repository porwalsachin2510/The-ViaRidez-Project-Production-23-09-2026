import { Schema, model, models, type InferSchemaType } from 'mongoose'
import { seoSchema, auditFields, statusField } from '@/lib/db/shared-schema'

const fleetCategorySchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, index: true },
    description: { type: String, default: '' },
    icon: { type: String, default: 'bus' },
    image: { type: String, default: null },
    capacityRange: { type: String, default: '' },
    order: { type: Number, default: 0 },
    seo: { type: seoSchema, default: () => ({}) },
    ...statusField,
  },
  { timestamps: true },
)
fleetCategorySchema.add(auditFields)

const fleetVehicleSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, index: true },
    category: {
      type: Schema.Types.ObjectId,
      ref: 'FleetCategory',
      required: true,
      index: true,
    },
    seatingCapacity: { type: Number, default: 0 },
    description: { type: String, default: '' },
    image: { type: String, default: null },
    gallery: { type: [String], default: [] },
    features: { type: [String], default: [] },
    specs: {
      type: Map,
      of: String,
      default: {},
    },
    order: { type: Number, default: 0 },
    featured: { type: Boolean, default: false },
    ...statusField,
  },
  { timestamps: true },
)
fleetVehicleSchema.add(auditFields)

export type FleetCategoryDoc = InferSchemaType<typeof fleetCategorySchema>
export type FleetVehicleDoc = InferSchemaType<typeof fleetVehicleSchema>

export const FleetCategory =
  models.FleetCategory || model('FleetCategory', fleetCategorySchema)
export const FleetVehicle =
  models.FleetVehicle || model('FleetVehicle', fleetVehicleSchema)
