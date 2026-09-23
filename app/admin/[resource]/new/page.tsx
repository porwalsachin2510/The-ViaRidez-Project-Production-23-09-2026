import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import { requireModule } from "@/lib/auth-helpers"
import { getResource, loadRelationOptions } from "@/lib/admin/resources"
import { ResourceForm } from "@/components/admin/resource-form"

export default async function NewResourcePage({
  params,
}: {
  params: Promise<{ resource: string }>
}) {
  const { resource } = await params
  const cfg = getResource(resource)
  if (!cfg) notFound()
  await requireModule(cfg.moduleKey)

  const relationOptions = await loadRelationOptions(cfg)

  return (
    <div className="mx-auto max-w-3xl">
      <Link
        href={`/admin/${cfg.key}`}
        className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to {cfg.label}
      </Link>
      <h1 className="mb-6 font-display text-2xl font-bold tracking-tight text-foreground">
        New {cfg.singular}
      </h1>
      <ResourceForm resourceKey={cfg.key} fields={cfg.fields} relationOptions={relationOptions} />
    </div>
  )
}
