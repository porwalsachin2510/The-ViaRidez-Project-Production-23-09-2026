import { NextResponse } from "next/server"
import { requireModule } from "@/lib/auth-helpers"
import {
  isCloudinaryConfigured,
  uploadBufferToCloudinary,
  UPLOAD_KINDS,
  type UploadKind,
} from "@/lib/cloudinary"
import { enforceRateLimit } from "@/lib/security/rate-limit"
import { requestMetadata } from "@/lib/security/request"

export const runtime = "nodejs"

// Admins may upload images (cover art, logos, avatars) and documents
// (downloadable resources). The `kind` field selects the ruleset.
const ADMIN_KINDS = new Set<UploadKind>(["image", "document"])

export async function POST(request: Request) {
  const user = await requireModule("media")
  const metadata = await requestMetadata()
  const limit = await enforceRateLimit(`upload:${metadata.ipHash}:${user.id}`, {
    limit: 40,
    windowMs: 60 * 60 * 1000,
  })
  if (!limit.allowed) {
    return NextResponse.json(
      { error: "Upload limit reached. Please try again later." },
      { status: 429, headers: { "Retry-After": String(limit.retryAfterSeconds) } },
    )
  }

  if (!isCloudinaryConfigured()) {
    return NextResponse.json({ error: "File uploads are not configured." }, { status: 500 })
  }

  const formData = await request.formData()
  const file = formData.get("file")
  const kindRaw = String(formData.get("kind") || "image") as UploadKind
  const kind = ADMIN_KINDS.has(kindRaw) ? kindRaw : "image"
  const rule = UPLOAD_KINDS[kind]

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file provided." }, { status: 400 })
  }
  if (!rule.mimes.includes(file.type)) {
    return NextResponse.json({ error: `Unsupported file type. Upload a valid ${rule.label}.` }, { status: 415 })
  }
  if (file.size > rule.maxBytes) {
    return NextResponse.json(
      { error: `File exceeds the ${Math.round(rule.maxBytes / (1024 * 1024))}MB limit.` },
      { status: 413 },
    )
  }

  const bytes = Buffer.from(await file.arrayBuffer())

  try {
    const result = await uploadBufferToCloudinary(bytes, {
      folder: rule.folder,
      resourceType: rule.resourceType,
      filename: file.name,
    })
    return NextResponse.json({
      url: result.secure_url,
      publicId: result.public_id,
      width: result.width,
      height: result.height,
      fileName: file.name,
      bytes: result.bytes,
      format: result.format,
    })
  } catch (error) {
    console.log("[v0] Cloudinary upload error:", (error as Error)?.message)
    return NextResponse.json({ error: "Upload failed. Please try again." }, { status: 500 })
  }
}
