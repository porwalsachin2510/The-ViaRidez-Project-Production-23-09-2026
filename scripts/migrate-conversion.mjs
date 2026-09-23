/**
 * Idempotent migration: wire the new conversion pages (quote wizard,
 * book-a-demo) and FAQ into Site Settings CTAs, navigation and footer.
 * Run: node --env-file-if-exists=/vercel/share/.env.project scripts/migrate-conversion.mjs
 */
import mongoose from "mongoose"

const uri = process.env.MONGODB_URI
if (!uri) {
  console.error("[v0] MONGODB_URI missing")
  process.exit(1)
}

await mongoose.connect(uri)
const col = mongoose.connection.db.collection("sitesettings")
const s = await col.findOne({ key: "global" })
if (!s) {
  console.error("[v0] settings doc not found")
  process.exit(1)
}

const set = {
  ctaPrimary: { label: "Get a Quote", href: "/get-quote", external: false },
  ctaSecondary: { label: "Book a Demo", href: "/book-demo", external: false },
}

// Footer: point "Get a Quote" to the wizard and add Book a Demo + FAQ.
const footerColumns = (s.footerColumns || []).map((c) => {
  if (c.title !== "Resources") return c
  const links = [...c.links]
  const gq = links.find((l) => l.label === "Get a Quote")
  if (gq) gq.href = "/get-quote"
  else links.unshift({ label: "Get a Quote", href: "/get-quote" })
  if (!links.some((l) => l.href === "/book-demo")) {
    links.splice(1, 0, { label: "Book a Demo", href: "/book-demo" })
  }
  if (!links.some((l) => l.href === "/faq")) {
    links.splice(2, 0, { label: "FAQ", href: "/faq" })
  }
  return { ...c, links }
})

await col.updateOne({ key: "global" }, { $set: { ...set, footerColumns } })
console.log("[v0] Settings updated: CTAs + footer links wired to /get-quote, /book-demo, /faq")
await mongoose.disconnect()
process.exit(0)
