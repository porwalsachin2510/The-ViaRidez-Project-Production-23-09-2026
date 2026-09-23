"use client"

import { useRef, useState } from "react"
import Image from "next/image"
import { FileText, GripVertical, ImageIcon, Loader2, UploadCloud, X } from "lucide-react"

type UploadMode = "image" | "document"

/** Shared Cloudinary upload call used by every uploader in this file. */
async function uploadToCloudinary(file: File, kind: UploadMode) {
  const body = new FormData()
  body.append("file", file)
  body.append("kind", kind)
  const res = await fetch("/api/admin/upload", { method: "POST", body })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || "Upload failed")
  return { url: data.url as string, fileName: (data.fileName as string) || file.name }
}

/**
 * Controlled uploader — the reusable core. Use this anywhere the value lives in
 * React state rather than in a form field (e.g. inside the JSON-serialised
 * page-section editor). There is deliberately NO "paste a URL" fallback: every
 * asset is uploaded to Cloudinary so the CMS never references arbitrary
 * external links.
 */
export function ImageUploader({
  value,
  onChange,
  mode = "image",
  fileName,
  onFileNameChange,
  compact = false,
}: {
  value: string
  onChange: (url: string) => void
  mode?: UploadMode
  fileName?: string
  onFileNameChange?: (name: string) => void
  compact?: boolean
}) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [dragOver, setDragOver] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const isDoc = mode === "document"
  const accept = isDoc
    ? ".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    : "image/*"

  async function handleFile(file: File) {
    setError(null)
    setUploading(true)
    try {
      const result = await uploadToCloudinary(file, isDoc ? "document" : "image")
      onChange(result.url)
      onFileNameChange?.(result.fileName)
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setUploading(false)
    }
  }

  const thumbSize = compact ? "h-16 w-24" : "h-24 w-32"

  return (
    <div className="flex items-start gap-3">
      <div className={`relative ${thumbSize} shrink-0 overflow-hidden rounded-lg border border-border bg-muted`}>
        {value ? (
          <>
            {isDoc ? (
              <div className="flex h-full w-full flex-col items-center justify-center gap-1 p-2 text-center text-accent">
                <FileText className="h-7 w-7" aria-hidden="true" />
                <span className="line-clamp-2 text-[10px] leading-tight text-muted-foreground">
                  {fileName || "Document"}
                </span>
              </div>
            ) : (
              <Image
                src={value || "/placeholder.svg"}
                alt="Preview"
                fill
                className="object-cover"
                sizes="128px"
                unoptimized={value.startsWith("http")}
              />
            )}
            <button
              type="button"
              onClick={() => {
                onChange("")
                onFileNameChange?.("")
              }}
              aria-label="Remove file"
              className="absolute right-1 top-1 rounded-full bg-background/90 p-1 text-foreground shadow ring-1 ring-border hover:bg-background"
            >
              <X className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
          </>
        ) : (
          <div className="flex h-full w-full items-center justify-center text-muted-foreground">
            {isDoc ? (
              <FileText className="h-6 w-6" aria-hidden="true" />
            ) : (
              <ImageIcon className="h-6 w-6" aria-hidden="true" />
            )}
          </div>
        )}
      </div>

      <div className="min-w-0 flex-1">
        <div
          onDragOver={(e) => {
            e.preventDefault()
            setDragOver(true)
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault()
            setDragOver(false)
            const file = e.dataTransfer.files?.[0]
            if (file) handleFile(file)
          }}
          onClick={() => inputRef.current?.click()}
          className={`flex cursor-pointer items-center gap-2 rounded-lg border border-dashed px-3 py-2.5 text-sm transition ${
            dragOver ? "border-accent bg-accent/5" : "border-border hover:border-accent/60"
          }`}
        >
          {uploading ? (
            <Loader2 className="h-4 w-4 shrink-0 animate-spin text-accent" aria-hidden="true" />
          ) : (
            <UploadCloud className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
          )}
          <span className="truncate text-muted-foreground">
            {uploading
              ? "Uploading to Cloudinary…"
              : isDoc
                ? "Click or drop a PDF / DOC / DOCX to upload"
                : value
                  ? "Click or drop an image to replace"
                  : "Click or drop an image to upload"}
          </span>
        </div>

        <input
          ref={inputRef}
          type="file"
          accept={accept}
          className="sr-only"
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (file) handleFile(file)
          }}
        />

        {error ? (
          <p className="mt-2 text-xs text-destructive">{error}</p>
        ) : compact ? null : (
          <p className="mt-2 text-xs text-muted-foreground">
            {isDoc
              ? "Documents are stored securely in Cloudinary (max 15MB)."
              : "Images are stored in your Cloudinary account (max 8MB)."}
          </p>
        )}
      </div>
    </div>
  )
}

/**
 * Form-field wrapper around {@link ImageUploader}. The stored value is always
 * the final Cloudinary URL, carried in a hidden input under `name`. For
 * documents the original file name is preserved in `<name>FileName`.
 */
export function ImageField({
  name,
  defaultValue = "",
  mode = "image",
}: {
  name: string
  defaultValue?: string
  mode?: UploadMode
}) {
  const [value, setValue] = useState(defaultValue)
  const [fileName, setFileName] = useState("")

  return (
    <>
      {/* The value actually submitted with the form. */}
      <input type="hidden" name={name} value={value} />
      {mode === "document" ? <input type="hidden" name={`${name}FileName`} value={fileName} /> : null}
      <ImageUploader
        value={value}
        onChange={setValue}
        mode={mode}
        fileName={fileName}
        onFileNameChange={setFileName}
      />
    </>
  )
}

/**
 * Multi-image uploader for `gallery` fields. Supports multi-select, drag & drop
 * of several files at once, removal and reordering. Submits the ordered URLs as
 * a newline-separated hidden input, which the save action already splits into a
 * string[] — so no backend change is required.
 */
export function GalleryField({ name, defaultValue = [] }: { name: string; defaultValue?: string[] }) {
  const [urls, setUrls] = useState<string[]>(defaultValue.filter(Boolean))
  const [uploading, setUploading] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [dragOver, setDragOver] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  async function handleFiles(files: FileList) {
    const list = Array.from(files).filter((f) => f.type.startsWith("image/"))
    if (!list.length) return
    setError(null)
    setUploading((n) => n + list.length)
    // Upload sequentially so a large multi-select can't blow the rate limit.
    for (const file of list) {
      try {
        const result = await uploadToCloudinary(file, "image")
        setUrls((prev) => [...prev, result.url])
      } catch (err) {
        setError((err as Error).message)
      } finally {
        setUploading((n) => n - 1)
      }
    }
  }

  const remove = (i: number) => setUrls((prev) => prev.filter((_, idx) => idx !== i))
  const move = (i: number, dir: -1 | 1) =>
    setUrls((prev) => {
      const next = [...prev]
      const j = i + dir
      if (j < 0 || j >= next.length) return prev
      ;[next[i], next[j]] = [next[j], next[i]]
      return next
    })

  return (
    <div>
      {/* Newline-joined so the existing `gallery` parser reassembles the array. */}
      <input type="hidden" name={name} value={urls.join("\n")} />

      {urls.length ? (
        <ul className="mb-3 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {urls.map((url, i) => (
            <li key={`${url}-${i}`} className="group relative overflow-hidden rounded-lg border border-border bg-muted">
              <div className="relative aspect-[4/3]">
                <Image
                  src={url || "/placeholder.svg"}
                  alt={`Gallery image ${i + 1}`}
                  fill
                  className="object-cover"
                  sizes="200px"
                  unoptimized={url.startsWith("http")}
                />
              </div>
              <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-1 bg-background/90 px-1.5 py-1">
                <span className="flex items-center gap-1 text-[10px] font-medium text-muted-foreground">
                  <GripVertical className="h-3 w-3" aria-hidden="true" />
                  {i + 1}
                </span>
                <span className="flex items-center gap-0.5">
                  <button
                    type="button"
                    onClick={() => move(i, -1)}
                    aria-label={`Move image ${i + 1} earlier`}
                    className="rounded border border-border px-1 text-[10px] text-muted-foreground hover:text-foreground"
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    onClick={() => move(i, 1)}
                    aria-label={`Move image ${i + 1} later`}
                    className="rounded border border-border px-1 text-[10px] text-muted-foreground hover:text-foreground"
                  >
                    ↓
                  </button>
                </span>
              </div>
              <button
                type="button"
                onClick={() => remove(i)}
                aria-label={`Remove image ${i + 1}`}
                className="absolute right-1 top-1 rounded-full bg-background/90 p-1 text-foreground shadow ring-1 ring-border hover:bg-background"
              >
                <X className="h-3.5 w-3.5" aria-hidden="true" />
              </button>
            </li>
          ))}
        </ul>
      ) : null}

      <div
        onDragOver={(e) => {
          e.preventDefault()
          setDragOver(true)
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault()
          setDragOver(false)
          if (e.dataTransfer.files?.length) handleFiles(e.dataTransfer.files)
        }}
        onClick={() => inputRef.current?.click()}
        className={`flex cursor-pointer items-center gap-2 rounded-lg border border-dashed px-3 py-2.5 text-sm transition ${
          dragOver ? "border-accent bg-accent/5" : "border-border hover:border-accent/60"
        }`}
      >
        {uploading > 0 ? (
          <Loader2 className="h-4 w-4 shrink-0 animate-spin text-accent" aria-hidden="true" />
        ) : (
          <UploadCloud className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
        )}
        <span className="text-muted-foreground">
          {uploading > 0
            ? `Uploading ${uploading} image${uploading === 1 ? "" : "s"} to Cloudinary…`
            : "Click or drop images to upload (you can select several at once)"}
        </span>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="sr-only"
        onChange={(e) => {
          if (e.target.files?.length) handleFiles(e.target.files)
          e.target.value = ""
        }}
      />

      {error ? (
        <p className="mt-2 text-xs text-destructive">{error}</p>
      ) : (
        <p className="mt-2 text-xs text-muted-foreground">
          Images are stored in your Cloudinary account (max 8MB each). Use the arrows to set the display order.
        </p>
      )}
    </div>
  )
}
