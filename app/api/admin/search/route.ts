import { NextResponse } from "next/server"
import { requireUser } from "@/lib/auth-helpers"
import { connectToDatabase } from "@/lib/db/mongoose"
import { Blog, Career, ContactEnquiry, Page, Resource, Service } from "@/models"

export async function GET(request: Request) {
  const user = await requireUser()
  const { searchParams } = new URL(request.url)
  const query = searchParams.get("q")?.trim() ?? ""
  if (query.length < 2) return NextResponse.json({ results: [] })

  await connectToDatabase()
  const pattern = new RegExp(query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i")
  const [pages, services, blogs, resources, careers, enquiries] = await Promise.all([
    Page.find({ $or: [{ title: pattern }, { slug: pattern }, { heroTitle: pattern }] }).select("title slug status").limit(8).lean(),
    Service.find({ $or: [{ name: pattern }, { slug: pattern }, { shortDescription: pattern }] }).select("name slug status").limit(8).lean(),
    Blog.find({ $or: [{ title: pattern }, { slug: pattern }, { excerpt: pattern }] }).select("title slug status").limit(8).lean(),
    Resource.find({ $or: [{ title: pattern }, { slug: pattern }] }).select("title slug status").limit(8).lean(),
    Career.find({ $or: [{ title: pattern }, { slug: pattern }] }).select("title slug status").limit(8).lean(),
    ContactEnquiry.find({ $or: [{ name: pattern }, { email: pattern }, { company: pattern }, { message: pattern }] }).select("name email company status createdAt").sort({ createdAt: -1 }).limit(8).lean(),
  ])

  const results = [
    ...pages.map((item) => ({ type: "Page", label: item.title, detail: item.slug, href: `/admin/pages/${item._id}` })),
    ...services.map((item) => ({ type: "Service", label: item.name, detail: item.slug, href: `/admin/services/${item._id}` })),
    ...blogs.map((item) => ({ type: "Blog", label: item.title, detail: item.slug, href: `/admin/blog/${item._id}` })),
    ...resources.map((item) => ({ type: "Resource", label: item.title, detail: item.slug, href: `/admin/resources/${item._id}` })),
    ...careers.map((item) => ({ type: "Career", label: item.title, detail: item.slug, href: `/admin/careers/${item._id}` })),
    ...enquiries.map((item) => ({ type: "Enquiry", label: item.name, detail: item.email, href: `/admin/enquiries` })),
  ]

  return NextResponse.json({ results })
}
