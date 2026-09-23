import { v2 as cloudinary, type UploadApiResponse } from "cloudinary"

// Trim values defensively — a stray trailing space in an env var (a common
// copy/paste artifact) otherwise triggers a "cloud_name mismatch" auth error.
const cloudName = process.env.CLOUDINARY_CLOUD_NAME?.trim()
const apiKey = process.env.CLOUDINARY_API_KEY?.trim()
const apiSecret = process.env.CLOUDINARY_API_SECRET?.trim()

cloudinary.config({
  cloud_name: cloudName,
  api_key: apiKey,
  api_secret: apiSecret,
  secure: true,
})

export { cloudinary }

export function isCloudinaryConfigured() {
  return Boolean(cloudName && apiKey && apiSecret)
}

/**
 * Streams a buffer to Cloudinary. Used by every upload endpoint (admin media,
 * public resume/logo uploads, resource documents) so the actual transport is
 * defined once. Images go through the `image` pipeline; documents (PDF/DOC/DOCX)
 * use `raw` so Cloudinary stores and serves them verbatim.
 */
export function uploadBufferToCloudinary(
  bytes: Buffer,
  opts: { folder: string; resourceType: "image" | "raw"; filename?: string },
): Promise<UploadApiResponse> {
  return new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream(
        {
          folder: opts.folder,
          resource_type: opts.resourceType,
          overwrite: false,
          use_filename: Boolean(opts.filename),
          unique_filename: true,
          ...(opts.filename ? { filename_override: opts.filename } : {}),
        },
        (error, uploaded) => {
          if (error || !uploaded) return reject(error ?? new Error("Upload failed"))
          resolve(uploaded)
        },
      )
      .end(bytes)
  })
}

export type UploadKind = "image" | "document" | "resume" | "logo"

/** Upload rule for a given asset kind: allowed MIME types, size cap, folder. */
interface UploadRule {
  resourceType: "image" | "raw"
  folder: string
  maxBytes: number
  // Typed as a plain readonly string[] (not a literal tuple) so callers can do
  // `rule.mimes.includes(file.type)` — with `as const` the element type across
  // the kind union collapses to `never` and the check fails to type-check.
  mimes: readonly string[]
  label: string
}

const IMAGE_MIMES = ["image/jpeg", "image/png", "image/webp", "image/avif", "image/svg+xml"] as const
const DOC_MIMES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
] as const

export const UPLOAD_KINDS: Record<UploadKind, UploadRule> = {
  image: {
    resourceType: "image",
    folder: "viaridez/images",
    maxBytes: 8 * 1024 * 1024,
    mimes: IMAGE_MIMES,
    label: "image",
  },
  document: {
    resourceType: "raw",
    folder: "viaridez/documents",
    maxBytes: 15 * 1024 * 1024,
    mimes: DOC_MIMES,
    label: "document (PDF, DOC or DOCX)",
  },
  resume: {
    resourceType: "raw",
    folder: "viaridez/resumes",
    maxBytes: 10 * 1024 * 1024,
    mimes: DOC_MIMES,
    label: "resume (PDF, DOC or DOCX)",
  },
  logo: {
    resourceType: "image",
    folder: "viaridez/logos",
    maxBytes: 4 * 1024 * 1024,
    mimes: IMAGE_MIMES,
    label: "logo image",
  },
}
