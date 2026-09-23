import { AdminPageHeader } from "@/components/admin/ui"
import { CommentsModeration } from "@/components/admin/comments-moderation"
import { getBlogComments, type CommentStatusFilter } from "@/lib/data/admin-queries"
import { requireModule } from "@/lib/auth-helpers"

export const dynamic = "force-dynamic"

const VALID: CommentStatusFilter[] = ["all", "pending", "approved", "rejected"]

export default async function CommentsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>
}) {
  await requireModule("comments")
  const { status } = await searchParams
  const filter: CommentStatusFilter = VALID.includes(status as CommentStatusFilter)
    ? (status as CommentStatusFilter)
    : "pending"

  const { comments, byStatus } = await getBlogComments(filter)

  return (
    <div>
      <AdminPageHeader
        title="Blog Comments"
        description={`${byStatus.pending} pending • ${byStatus.approved} approved • ${byStatus.rejected} rejected`}
      />
      <CommentsModeration comments={comments} byStatus={byStatus} filter={filter} />
    </div>
  )
}
