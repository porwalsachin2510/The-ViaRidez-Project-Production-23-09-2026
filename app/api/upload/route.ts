import { NextResponse } from "next/server"
import {
  isCloudinaryConfigured,
  uploadBufferToCloudinary,
  UPLOAD_KINDS,
  type UploadKind,
} from "@/lib/cloudinary"
import { enforceRateLimit } from "@/lib/security/rate-limit"
import { requestMetadata } from "@/lib/security/request"

export const runtime = "nodejs"

// Public, unauthenticated upload endpoint for site visitors:
//  - `resume` — job applicants attach a CV (PDF/DOC/DOCX)
//  - `logo`   — fleet partners attach a company logo (image)
// Tightly rate-limited by IP because there's no sign-in gate.
const PUBLIC_KINDS = new Set<UploadKind>(["resume", "logo"])

export async function POST(request: Request) {
  const metadata = await requestMetadata()
  const limit = await enforceRateLimit(`public-upload:${metadata.ipHash}`, {
    limit: 12,
    windowMs: 60 * 60 * 1000,
  })
  if (!limit.allowed) {
    return NextResponse.json(
      { error: "Too many uploads. Please try again later." },
      { status: 429, headers: { "Retry-After": String(limit.retryAfterSeconds) } },
    )
  }

  if (!isCloudinaryConfigured()) {
    return NextResponse.json({ error: "File uploads are not configured yet." }, { status: 500 })
  }

  const formData = await request.formData()
  const file = formData.get("file")
  const kindRaw = String(formData.get("kind") || "") as UploadKind
  if (!PUBLIC_KINDS.has(kindRaw)) {
    return NextResponse.json({ error: "Invalid upload type." }, { status: 400 })
  }
  const rule = UPLOAD_KINDS[kindRaw]

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
      fileName: file.name,
      bytes: result.bytes,
      format: result.format,
    })
  } catch (error) {
    console.log("[v0] Public Cloudinary upload error:", (error as Error)?.message)
    return NextResponse.json({ error: "Upload failed. Please try again." }, { status: 500 })
  }
}
