"use client"

import { useRef, useState } from "react"
import Image from "next/image"
import { CheckCircle2, FileText, ImageIcon, Loader2, UploadCloud, X } from "lucide-react"
import { cn } from "@/lib/utils"

type UploadKind = "resume" | "logo"

interface FileUploadFieldProps {
  label: string
  name: string
  kind: UploadKind
  required?: boolean
  error?: string
  help?: string
}

const RULES: Record<UploadKind, { accept: string; hint: string; isImage: boolean }> = {
  resume: {
    accept:
      ".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    hint: "PDF, DOC or DOCX · max 10MB",
    isImage: false,
  },
  logo: {
    accept: "image/*",
    hint: "PNG, JPG, WEBP or SVG · max 4MB",
    isImage: true,
  },
}

/**
 * Public, accessible upload control used on marketing forms (job applications,
 * fleet-partner applications). Streams the file to the public /api/upload
 * endpoint (Cloudinary) and stores the resulting URL + file name in hidden
 * inputs so the surrounding <form action> submits real, hosted asset URLs —
 * never a pasted link.
 */
export function FileUploadField({ label, name, kind, required, error, help }: FileUploadFieldProps) {
  const rule = RULES[kind]
  const [url, setUrl] = useState("")
  const [fileName, setFileName] = useState("")
  const [uploading, setUploading] = useState(false)
  const [localError, setLocalError] = useState<string | null>(null)
  const [dragOver, setDragOver] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  async function uploadFile(file: File) {
    setLocalError(null)
    setUploading(true)
    try {
      const body = new FormData()
      body.append("file", file)
      body.append("kind", kind)
      const res = await fetch("/api/upload", { method: "POST", body })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Upload failed")
      setUrl(data.url)
      setFileName(data.fileName || file.name)
    } catch (err) {
      setLocalError((err as Error).message)
      setUrl("")
      setFileName("")
    } finally {
      setUploading(false)
    }
  }

  const shownError = localError || error

  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-sm font-medium text-foreground">
        {label} {required ? <span className="text-accent">*</span> : null}
      </span>

      {/* Hidden inputs carry the hosted asset URL + name into the form action. */}
      <input type="hidden" name={name} value={url} required={required} />
      <input type="hidden" name={`${name}FileName`} value={fileName} />

      {url ? (
        <div className="flex items-center gap-3 rounded-lg border border-accent/40 bg-accent/5 px-3 py-2.5">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-md bg-background">
            {rule.isImage ? (
              <Image src={url || "/placeholder.svg"} alt="" width={40} height={40} className="h-10 w-10 object-cover" />
            ) : (
              <FileText className="h-5 w-5 text-accent" aria-hidden="true" />
            )}
          </span>
          <span className="flex-1 truncate text-sm text-foreground">{fileName || "Uploaded file"}</span>
          <CheckCircle2 className="h-4 w-4 shrink-0 text-accent" aria-hidden="true" />
          <button
            type="button"
            onClick={() => {
              setUrl("")
              setFileName("")
              if (inputRef.current) inputRef.current.value = ""
            }}
            aria-label="Remove file"
            className="shrink-0 rounded-full p-1 text-muted-foreground hover:bg-background hover:text-foreground"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault()
            setDragOver(true)
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault()
            setDragOver(false)
            const file = e.dataTransfer.files?.[0]
            if (file) uploadFile(file)
          }}
          className={cn(
            "flex items-center gap-2.5 rounded-lg border border-dashed px-3 py-3 text-left text-sm transition-colors",
            dragOver ? "border-accent bg-accent/5" : "border-border hover:border-accent/60",
            shownError && "border-destructive",
          )}
        >
          {uploading ? (
            <Loader2 className="h-4 w-4 shrink-0 animate-spin text-accent" aria-hidden="true" />
          ) : rule.isImage ? (
            <ImageIcon className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
          ) : (
            <UploadCloud className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
          )}
          <span className="text-muted-foreground">
            {uploading ? "Uploading…" : `Click or drop to upload · ${rule.hint}`}
          </span>
        </button>
      )}

      <input
        ref={inputRef}
        type="file"
        accept={rule.accept}
        className="sr-only"
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) uploadFile(file)
        }}
      />

      {shownError ? (
        <p className="text-xs font-medium text-destructive">{shownError}</p>
      ) : help ? (
        <p className="text-xs text-muted-foreground">{help}</p>
      ) : null}
    </div>
  )
}
