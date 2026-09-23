"use client"

import { useId } from "react"
import { cn } from "@/lib/utils"

interface FieldProps {
  label: string
  name: string
  type?: string
  required?: boolean
  placeholder?: string
  error?: string
  defaultValue?: string
  autoComplete?: string
  min?: string
  max?: string
  /** Native constraint validation — mirrors the server-side Zod rules. */
  minLength?: number
  maxLength?: number
  pattern?: string
  inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"]
  /** Tooltip shown by the browser when a pattern/constraint fails. */
  title?: string
  help?: string
}

const baseInput =
  "w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground/60 focus:border-accent focus:ring-2 focus:ring-accent/20 invalid:border-destructive/60"

export function Field({
  label,
  name,
  type = "text",
  required,
  placeholder,
  error,
  defaultValue,
  autoComplete,
  min,
  max,
  minLength,
  maxLength,
  pattern,
  inputMode,
  title,
  help,
}: FieldProps) {
  const id = useId()
  // Sensible defaults so every input validates natively without extra wiring.
  const resolvedInputMode = inputMode ?? (type === "email" ? "email" : type === "tel" ? "tel" : undefined)
  const describedBy = [error ? `${id}-error` : null, help ? `${id}-help` : null].filter(Boolean).join(" ") || undefined
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-medium text-foreground">
        {label} {required ? <span className="text-accent">*</span> : null}
      </label>
      <input
        id={id}
        name={name}
        type={type}
        required={required}
        placeholder={placeholder}
        defaultValue={defaultValue}
        autoComplete={autoComplete}
        min={min}
        max={max}
        minLength={minLength}
        maxLength={maxLength}
        pattern={pattern}
        inputMode={resolvedInputMode}
        title={title}
        aria-invalid={!!error}
        aria-describedby={describedBy}
        className={cn(baseInput, error && "border-destructive focus:border-destructive focus:ring-destructive/20")}
      />
      {help ? (
        <p id={`${id}-help`} className="text-xs text-muted-foreground">
          {help}
        </p>
      ) : null}
      {error ? (
        <p id={`${id}-error`} className="text-xs font-medium text-destructive">
          {error}
        </p>
      ) : null}
    </div>
  )
}

export function TextArea({
  label,
  name,
  required,
  placeholder,
  error,
  rows = 5,
  minLength,
  maxLength,
  title,
}: FieldProps & { rows?: number }) {
  const id = useId()
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-medium text-foreground">
        {label} {required ? <span className="text-accent">*</span> : null}
      </label>
      <textarea
        id={id}
        name={name}
        required={required}
        placeholder={placeholder}
        rows={rows}
        minLength={minLength}
        maxLength={maxLength}
        title={title}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-error` : undefined}
        className={cn(baseInput, "resize-y", error && "border-destructive focus:border-destructive focus:ring-destructive/20")}
      />
      {error ? (
        <p id={`${id}-error`} className="text-xs font-medium text-destructive">
          {error}
        </p>
      ) : null}
    </div>
  )
}

export function SelectField({
  label,
  name,
  required,
  error,
  options,
  placeholder = "Select an option",
}: FieldProps & { options: string[] }) {
  const id = useId()
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-medium text-foreground">
        {label} {required ? <span className="text-accent">*</span> : null}
      </label>
      <select
        id={id}
        name={name}
        required={required}
        defaultValue=""
        aria-invalid={!!error}
        className={cn(baseInput, "appearance-none", error && "border-destructive")}
      >
        <option value="" disabled>
          {placeholder}
        </option>
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
      {error ? <p className="text-xs font-medium text-destructive">{error}</p> : null}
    </div>
  )
}

/** Hidden honeypot field — real users never see or fill it. */
export function Honeypot() {
  return (
    <div aria-hidden="true" className="absolute left-[-9999px] h-0 w-0 overflow-hidden">
      <label htmlFor="website">Website</label>
      <input id="website" name="website" type="text" tabIndex={-1} autoComplete="off" />
    </div>
  )
}
