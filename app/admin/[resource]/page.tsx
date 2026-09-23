import { notFound } from "next/navigation"
import { requireModule } from "@/lib/auth-helpers"
import { connectToDatabase } from "@/lib/db/mongoose"
import { getResource } from "@/lib/admin/resources"
import { ResourceList } from "@/components/admin/resource-list"

export const dynamic = "force-dynamic"

export default async function ResourceListPage({
  params,
}: {
  params: Promise<{ resource: string }>
}) {
  const { resource } = await params
  const cfg = getResource(resource)
  if (!cfg) notFound()

  await requireModule(cfg.moduleKey)
  await connectToDatabase()

  const docs = await cfg.model
    .find({ isDeleted: { $ne: true } })
    .sort({ order: 1, createdAt: -1 })
    .lean()

  const records = JSON.parse(JSON.stringify(docs)) as Record<string, unknown>[]
  const columns = cfg.fields.filter((f) => f.listColumn)

  return (
    <ResourceList
      resourceKey={cfg.key}
      label={cfg.label}
      singular={cfg.singular}
      columns={columns}
      records={records}
    />
  )
}
