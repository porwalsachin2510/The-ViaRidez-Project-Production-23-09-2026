import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/db/mongoose"
import { Blog, BlogClap } from "@/models"
import { requestMetadata } from "@/lib/security/request"
import { enforceRateLimit } from "@/lib/security/rate-limit"

export const runtime = "nodejs"

const MAX_CLAPS_PER_VISITOR = 50

async function loadPost(slug: string) {
  await connectToDatabase()
  return Blog.findOne({ slug, isDeleted: false, status: "published" }).select("_id claps").lean()
}

/** Current total claps for the article + how many this visitor has given. */
export async function GET(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  try {
    const post = await loadPost(slug)
    if (!post) return NextResponse.json({ error: "Not found" }, { status: 404 })
    const { ipHash } = await requestMetadata()
    const mine = await BlogClap.findOne({ blogSlug: slug, ipHash }).select("count").lean()
    return NextResponse.json({ claps: post.claps ?? 0, userClaps: mine?.count ?? 0, max: MAX_CLAPS_PER_VISITOR })
  } catch (error) {
    console.log("[v0] blog clap GET error:", (error as Error)?.message)
    return NextResponse.json({ error: "Unable to load claps" }, { status: 500 })
  }
}

/**
 * Add claps. The body's `add` count is clamped so a visitor can never exceed
 * 50 total claps on an article (Medium's model). We compute the real applied
 * delta and increment the article's running total by exactly that amount, so
 * the DB stays consistent even under rapid clicking.
 */
export async function POST(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  try {
    const { ipHash } = await requestMetadata()
    const limit = await enforceRateLimit(`blog-clap:${ipHash}:${slug}`, { limit: 60, windowMs: 60 * 1000 })
    if (!limit.allowed) {
      return NextResponse.json({ error: "Too fast — take a breath." }, { status: 429 })
    }

    const post = await loadPost(slug)
    if (!post) return NextResponse.json({ error: "Not found" }, { status: 404 })

    const body = await request.json().catch(() => ({}))
    const requested = Math.floor(Number(body?.add))
    const add = Number.isFinite(requested) ? Math.min(Math.max(requested, 1), MAX_CLAPS_PER_VISITOR) : 1

    const existing = await BlogClap.findOne({ blogSlug: slug, ipHash }).select("count").lean()
    const current = existing?.count ?? 0
    const nextCount = Math.min(current + add, MAX_CLAPS_PER_VISITOR)
    const delta = nextCount - current

    if (delta > 0) {
      await BlogClap.updateOne(
        { blogSlug: slug, ipHash },
        { $set: { count: nextCount, blog: post._id } },
        { upsert: true },
      )
      const updated = await Blog.findByIdAndUpdate(post._id, { $inc: { claps: delta } }, { returnDocument: "after" })
        .select("claps")
        .lean()
      return NextResponse.json({ claps: updated?.claps ?? (post.claps ?? 0) + delta, userClaps: nextCount, max: MAX_CLAPS_PER_VISITOR })
    }

    return NextResponse.json({ claps: post.claps ?? 0, userClaps: current, max: MAX_CLAPS_PER_VISITOR })
  } catch (error) {
    console.log("[v0] blog clap POST error:", (error as Error)?.message)
    return NextResponse.json({ error: "Unable to record clap" }, { status: 500 })
  }
}
