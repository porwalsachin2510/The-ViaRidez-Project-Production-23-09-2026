"use server"

import { revalidatePath } from "next/cache"
import { isValidObjectId } from "mongoose"
import { requireModule } from "@/lib/auth-helpers"
import { connectToDatabase } from "@/lib/db/mongoose"
import { BlogComment } from "@/models"
import { recordAuditEvent } from "@/lib/audit"

const ALLOWED_STATUSES = ["pending", "approved", "rejected"] as const
type CommentStatus = (typeof ALLOWED_STATUSES)[number]

/** Approve or reject a reader comment. Only approved comments show publicly. */
export async function setCommentStatus(id: string, status: CommentStatus) {
  const user = await requireModule("comments")
  if (!isValidObjectId(id) || !ALLOWED_STATUSES.includes(status)) {
    return { ok: false, error: "Invalid request" }
  }

  await connectToDatabase()
  const comment = await BlogComment.findByIdAndUpdate(id, { $set: { status } }, { returnDocument: "after" })
    .select("blogSlug")
    .lean()
  if (!comment) return { ok: false, error: "Comment not found" }

  await recordAuditEvent({ user, action: "moderate_comment", entity: "blog-comment", entityId: id, meta: { status } })

  revalidatePath("/admin/comments")
  // Refresh the public article so a newly approved/hidden comment updates.
  revalidatePath(`/blog/${comment.blogSlug}`)
  return { ok: true }
}

/** Permanently delete a comment (e.g. spam / abuse). */
export async function deleteComment(id: string) {
  const user = await requireModule("comments")
  if (!isValidObjectId(id)) return { ok: false, error: "Invalid id" }

  await connectToDatabase()
  const comment = await BlogComment.findByIdAndDelete(id).select("blogSlug").lean()
  if (!comment) return { ok: false, error: "Comment not found" }

  await recordAuditEvent({ user, action: "delete_comment", entity: "blog-comment", entityId: id })

  revalidatePath("/admin/comments")
  revalidatePath(`/blog/${comment.blogSlug}`)
  return { ok: true }
}
