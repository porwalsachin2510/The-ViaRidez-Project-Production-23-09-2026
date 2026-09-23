import type { Model } from "mongoose"

/**
 * Pure, runtime-free type definitions shared between the server-only resource
 * registry (`lib/admin/resources.ts`) and the client admin components
 * (`resource-form.tsx`, `resource-list.tsx`).
 *
 * This module MUST NOT import any runtime value (no Mongoose models, no
 * `connectToDatabase`, etc.). Keeping it free of side effects guarantees that
 * client components can reference these types without ever pulling the
 * server-only registry — with its live model references — into the client
 * module graph. `import type { Model }` above is a type-only import and is
 * fully erased at build time.
 */

export type FieldType =
  | "text"
  | "textarea"
  | "richtext"
  | "number"
  | "boolean"
  | "date"
  | "image"
  | "file"
  | "slug"
  | "tags"
  | "lines"
  | "gallery"
  | "keyvalue"
  | "objectlist"
  | "blocks"
  | "relation"
  | "json"
  | "select"
  | "status"

export interface ObjectFieldConfig {
  name: string
  label: string
  placeholder?: string
}

export interface RelationConfig {
  /**
   * Key into the server-only RELATION_MODELS map identifying which collection
   * the options are read from. A plain string so the config stays serializable
   * and can be passed from Server Components into the client form.
   */
  collection: string
  /** Field on the related document used as the visible label. */
  labelField: string
  /** Exclude the current record from the options (e.g. a service can't be its own parent). */
  excludeSelf?: boolean
  /** Label for the empty option. */
  emptyLabel?: string
}

export interface FieldConfig {
  name: string
  label: string
  type: FieldType
  required?: boolean
  help?: string
  options?: string[]
  /** Sub-fields for an `objectlist` (repeatable object rows). */
  itemFields?: ObjectFieldConfig[]
  /** Source config for a `relation` select. */
  relation?: RelationConfig
  /** Column in list view. */
  listColumn?: boolean
}

export interface ResourceConfig {
  key: string
  label: string
  singular: string
  model: Model<unknown>
  /** Which module key gates access (matches auth-helpers module map). */
  moduleKey: string
  /** Field used as the display title in lists. */
  titleField: string
  fields: FieldConfig[]
}

export type RelationOptions = Record<string, { value: string; label: string }[]>
