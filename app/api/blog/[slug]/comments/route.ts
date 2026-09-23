import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/db/mongoose"
import { Blog, BlogComment } from "@/models"
import { requestMetadata } from "@/lib/security/request"
import { enforceRateLimit } from "@/lib/security/rate-limit"
import { blogCommentSchema } from "@/lib/validation/forms"
import { publishNotification } from "@/lib/notifications/bus"

export const runtime = "nodejs"

/** Public list of APPROVED comments for an article, oldest first. */
export async function GET(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  try {
    await connectToDatabase()
    const comments = await BlogComment.find({ blogSlug: slug, status: "approved" })
      .sort({ createdAt: 1 })
      .select("name body createdAt")
      .lean()
    const items = comments.map((c) => ({
      id: String(c._id),
      name: c.name,
      body: c.body,
      createdAt: c.createdAt,
    }))
    return NextResponse.json({ comments: items })
  } catch (error) {
    console.log("[v0] blog comments GET error:", (error as Error)?.message)
    return NextResponse.json({ comments: [] })
  }
}

/**
 * Submit a comment. Comments are moderation-first: every submission is stored
 * as `pending` and is NOT shown on the site until an admin approves it. This
 * keeps a no-account marketing blog safe from spam and abuse. Rate-limited per
 * IP, with a honeypot to trap bots.
 */
export async function POST(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  try {
    const { ipHash } = await requestMetadata()
    const limit = await enforceRateLimit(`blog-comment:${ipHash}`, { limit: 6, windowMs: 60 * 60 * 1000 })
    if (!limit.allowed) {
      return NextResponse.json(
        { error: "You've posted a few comments already. Please try again later." },
        { status: 429 },
      )
    }

    const raw = await request.json().catch(() => ({}))
    const parsed = blogCommentSchema.safeParse(raw)
    if (!parsed.success) {
      const first = parsed.error.issues[0]
      return NextResponse.json({ error: first?.message || "Please check your input." }, { status: 400 })
    }
    // Honeypot hit — pretend success without persisting anything.
    if (parsed.data.website) {
      return NextResponse.json({ ok: true, message: "Thanks — your comment is awaiting review." })
    }

    await connectToDatabase()
    const post = await Blog.findOne({ slug, isDeleted: false, status: "published" }).select("_id").lean()
    if (!post) return NextResponse.json({ error: "Article not found." }, { status: 404 })

    await BlogComment.create({
      blog: post._id,
      blogSlug: slug,
      name: parsed.data.name,
      email: parsed.data.email,
      body: parsed.data.body,
      status: "pending",
      ipHash,
    })

    // Notify admins in real time so pending comments can be moderated promptly.
    await publishNotification(
      "comment",
      "New blog comment awaiting review",
      `${parsed.data.name} on “${slug}”`,
      "/admin/comments",
    ).catch((error) => console.log("[v0] comment notification error:", (error as Error)?.message))

    return NextResponse.json({
      ok: true,
      message: "Thanks — your comment has been submitted and will appear once our team approves it.",
    })
  } catch (error) {
    console.log("[v0] blog comments POST error:", (error as Error)?.message)
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 })
  }
}
