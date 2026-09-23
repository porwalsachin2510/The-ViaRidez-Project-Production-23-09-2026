import { requireRole } from "@/lib/auth-helpers"
import { connectToDatabase } from "@/lib/db/mongoose"
import { User } from "@/models"
import { UsersManager } from "@/components/admin/users-manager"

export const dynamic = "force-dynamic"

export default async function UsersPage() {
  const me = await requireRole(["admin"])
  await connectToDatabase()

  const docs = await User.find({}).sort({ createdAt: 1 }).lean()
  const users = JSON.parse(JSON.stringify(docs)).map((u: Record<string, unknown>) => ({
    id: String(u._id),
    name: (u.name as string) ?? "",
    email: (u.email as string) ?? "",
    role: (u.role as string) ?? "content_writer",
    isActive: u.isActive !== false,
    isSelf: String(u._id) === me.id,
  }))

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold tracking-tight text-foreground">Users &amp; Roles</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage who can access the control centre and what they can do.
        </p>
      </div>
      <UsersManager users={users} />
    </div>
  )
}
