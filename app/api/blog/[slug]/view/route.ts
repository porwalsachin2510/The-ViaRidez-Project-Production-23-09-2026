import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/db/mongoose"
import { Blog, BlogView } from "@/models"
import { requestMetadata } from "@/lib/security/request"

export const runtime = "nodejs"

/**
 * Records a real, de-duplicated view for an article. A repeat visit from the
 * same visitor (ipHash) on the same calendar day is a no-op, so `Blog.views`
 * tracks unique daily reads instead of raw refreshes. Returns the current
 * totals so the reader UI can display live numbers.
 */
export async function POST(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params

  try {
    await connectToDatabase()
    const post = await Blog.findOne({ slug, isDeleted: false, status: "published" })
      .select("_id views claps")
      .lean()
    if (!post) return NextResponse.json({ error: "Not found" }, { status: 404 })

    const { ipHash } = await requestMetadata()
    const day = new Date().toISOString().slice(0, 10)

    let counted = false
    try {
      await BlogView.create({ blog: post._id, blogSlug: slug, ipHash, day })
      counted = true
    } catch (error) {
      // Duplicate {slug, ipHash, day} — already counted today. Ignore.
      if (!(error && typeof error === "object" && "code" in error && error.code === 11000)) {
        throw error
      }
    }

    let views = post.views ?? 0
    if (counted) {
      const updated = await Blog.findByIdAndUpdate(post._id, { $inc: { views: 1 } }, { returnDocument: "after" })
        .select("views")
        .lean()
      views = updated?.views ?? views + 1
    }

    return NextResponse.json({ views, claps: post.claps ?? 0, counted })
  } catch (error) {
    console.log("[v0] blog view error:", (error as Error)?.message)
    return NextResponse.json({ error: "Unable to record view" }, { status: 500 })
  }
}
