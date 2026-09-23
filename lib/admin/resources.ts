import {
  Service,
  FleetCategory,
  Industry,
  Location,
  FreeZone,
  Blog,
  BlogCategory,
  Testimonial,
  Client,
  CaseStudy,
  TeamMember,
  Faq,
  Resource,
  Page,
  Career,
  Redirect,
} from "@/models"
import type { Model } from "mongoose"
import { connectToDatabase } from "@/lib/db/mongoose"
import type {
  FieldConfig,
  ObjectFieldConfig,
  RelationConfig,
  ResourceConfig,
  FieldType,
  RelationOptions,
} from "./resource-types"

// Re-export the shared types so existing imports from "@/lib/admin/resources"
// keep working. The definitions live in the runtime-free `resource-types`
// module so client components can reference them without pulling this
// server-only registry (with its live Mongoose model references) into the
// client module graph.
export type {
  FieldConfig,
  ObjectFieldConfig,
  RelationConfig,
  ResourceConfig,
  FieldType,
  RelationOptions,
}

const baseSeoFields: FieldConfig[] = [
  { name: "seo.metaTitle", label: "Meta title", type: "text", help: "Overrides the default <title>." },
  { name: "seo.metaDescription", label: "Meta description", type: "textarea" },
  { name: "seo.keywords", label: "Keywords", type: "tags", help: "Comma-separated SEO keywords." },
]

export const RESOURCES: Record<string, ResourceConfig> = {
  pages: {
    key: "pages",
    label: "Site Pages",
    singular: "Site Page",
    model: Page as unknown as Model<unknown>,
    moduleKey: "pages",
    titleField: "title",
    fields: [
      { name: "title", label: "Internal title", type: "text", required: true, listColumn: true },
    { name: "slug", label: "Slug", type: "slug", required: true, listColumn: true },
    { name: "heroEyebrow", label: "Hero eyebrow", type: "text", help: "Small label above the hero title, e.g. 'Where we operate'." },
    { name: "heroTitle", label: "Hero title", type: "text" },
    { name: "heroSubtitle", label: "Hero subtitle", type: "textarea" },
    { name: "heroImage", label: "Hero image", type: "image", help: "Optional background image behind the hero. Leave empty for the plain navy hero." },
      { name: "body", label: "Page body (optional Markdown)", type: "richtext", help: "Rendered after all sections. Leave blank if the page is built entirely from sections." },
      { name: "sections", label: "Page sections", type: "blocks", help: "Build the page from content blocks. Add, remove and reorder sections; each block type has its own fields and repeatable items." },
      { name: "status", label: "Status", type: "status", listColumn: true },
      ...baseSeoFields,
    ],
  },
  services: {
    key: "services",
    label: "Services",
    singular: "Service",
    model: Service as unknown as Model<unknown>,
    moduleKey: "services",
    titleField: "title",
    fields: [
      { name: "title", label: "Title", type: "text", required: true, listColumn: true },
      { name: "slug", label: "Slug", type: "slug", required: true, listColumn: true },
      {
        name: "parent",
        label: "Parent service",
        type: "relation",
        relation: { collection: "services", labelField: "title", excludeSelf: true, emptyLabel: "None (top-level category)" },
        help: "Leave empty for a top-level category. Set a parent to make this a sub-service listed under that category.",
      },
      { name: "category", label: "Category", type: "select", options: ["corporate", "specialized", "free-zone", "mice", "general"], listColumn: true },
      { name: "icon", label: "Icon", type: "text", help: "Lucide icon key, e.g. bus, briefcase." },
      { name: "excerpt", label: "Excerpt", type: "textarea", help: "Short summary shown in listings and cards." },
      { name: "heroTitle", label: "Hero title", type: "text", help: "Large title on the service page. Defaults to the title." },
      { name: "heroSubtitle", label: "Hero subtitle", type: "textarea", help: "Intro line under the hero title." },
      { name: "heroImage", label: "Hero image", type: "image" },
      { name: "body", label: "Body", type: "richtext", help: "Main body copy. Separate paragraphs with a blank line." },
      {
        name: "features",
        label: "Features",
        type: "objectlist",
        help: "Feature highlights shown in a grid on the service page.",
        itemFields: [
          { name: "icon", label: "Icon", placeholder: "route" },
          { name: "title", label: "Title", placeholder: "Route optimisation" },
          { name: "description", label: "Description", placeholder: "Data-driven routing tuned to your shifts." },
        ],
      },
      { name: "benefits", label: "Key benefits", type: "lines", help: "One benefit per line. Shown in the sidebar." },
      { name: "featured", label: "Featured service", type: "boolean", help: "Featured services are surfaced first across the site." },
      { name: "order", label: "Order", type: "number" },
      { name: "status", label: "Status", type: "status", listColumn: true },
      ...baseSeoFields,
    ],
  },
  blog: {
    key: "blog",
    label: "Blog",
    singular: "Article",
    model: Blog as unknown as Model<unknown>,
    moduleKey: "blog",
    titleField: "title",
    fields: [
      { name: "title", label: "Title", type: "text", required: true, listColumn: true },
      { name: "slug", label: "Slug", type: "slug", required: true, listColumn: true },
      {
        name: "category",
        label: "Category",
        type: "relation",
        relation: { collection: "blogCategories", labelField: "name", emptyLabel: "Uncategorised" },
      },
      { name: "excerpt", label: "Excerpt", type: "textarea", help: "Short summary shown in listings and social cards." },
      { name: "coverImage", label: "Cover image", type: "image" },
      { name: "authorName", label: "Author name", type: "text", help: "Displayed on the article byline. Defaults to the ViaRidez Editorial Team." },
      { name: "authorRole", label: "Author role", type: "text", help: "e.g. Head of Mobility Strategy" },
      { name: "authorAvatar", label: "Author photo", type: "image" },
      { name: "tags", label: "Tags", type: "tags" },
      { name: "readingTime", label: "Reading time (min)", type: "number", help: "Leave blank to auto-estimate from the body length." },
      { name: "body", label: "Body", type: "richtext", help: "Supports Markdown: # headings, **bold**, _italic_, lists, > quotes, [links](url) and ![alt](image-url)." },
      { name: "featured", label: "Featured article", type: "boolean" },
      { name: "publishedAt", label: "Publish date", type: "date", help: "Leave blank to stamp automatically when published." },
      { name: "status", label: "Status", type: "status", listColumn: true },
      ...baseSeoFields,
    ],
  },
  testimonials: {
    key: "testimonials",
    label: "Testimonials",
    singular: "Testimonial",
    model: Testimonial as unknown as Model<unknown>,
    moduleKey: "testimonials",
    titleField: "author",
    fields: [
      { name: "author", label: "Author", type: "text", required: true, listColumn: true },
      { name: "role", label: "Role", type: "text", listColumn: true },
      { name: "company", label: "Company", type: "text", listColumn: true },
      { name: "quote", label: "Quote", type: "textarea", required: true },
      { name: "avatar", label: "Avatar", type: "image" },
      { name: "rating", label: "Rating (1-5)", type: "number" },
      { name: "featured", label: "Featured", type: "boolean", help: "Featured testimonials appear on the homepage and key pages." },
      { name: "order", label: "Order", type: "number" },
      { name: "status", label: "Status", type: "status", listColumn: true },
    ],
  },
  faqs: {
    key: "faqs",
    label: "FAQs",
    singular: "FAQ",
    model: Faq as unknown as Model<unknown>,
    moduleKey: "faqs",
    titleField: "question",
    fields: [
      { name: "question", label: "Question", type: "text", required: true, listColumn: true },
      { name: "answer", label: "Answer", type: "textarea", required: true },
      { name: "category", label: "Category", type: "text", listColumn: true },
      { name: "order", label: "Order", type: "number" },
      { name: "status", label: "Status", type: "status", listColumn: true },
    ],
  },
  clients: {
    key: "clients",
    label: "Clients",
    singular: "Client",
    model: Client as unknown as Model<unknown>,
    moduleKey: "clients",
    titleField: "name",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, listColumn: true },
      { name: "logo", label: "Logo", type: "image" },
      { name: "website", label: "Website", type: "text" },
      { name: "industry", label: "Industry", type: "text", listColumn: true },
      { name: "featured", label: "Featured", type: "boolean", help: "Featured clients appear first on the client wall." },
      { name: "order", label: "Order", type: "number" },
      { name: "status", label: "Status", type: "status", listColumn: true },
    ],
  },
  team: {
    key: "team",
    label: "Team",
    singular: "Team member",
    model: TeamMember as unknown as Model<unknown>,
    moduleKey: "team",
    titleField: "name",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, listColumn: true },
      { name: "role", label: "Role", type: "text", listColumn: true },
      { name: "photo", label: "Photo", type: "image" },
      { name: "bio", label: "Bio", type: "textarea" },
      { name: "linkedin", label: "LinkedIn URL", type: "text", help: "Full profile URL, e.g. https://linkedin.com/in/…" },
      { name: "order", label: "Order", type: "number" },
      { name: "status", label: "Status", type: "status", listColumn: true },
    ],
  },
  industries: {
    key: "industries",
    label: "Industries",
    singular: "Industry",
    model: Industry as unknown as Model<unknown>,
    moduleKey: "industries",
    titleField: "name",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, listColumn: true },
      { name: "slug", label: "Slug", type: "slug", required: true, listColumn: true },
      { name: "excerpt", label: "Excerpt", type: "textarea" },
      { name: "icon", label: "Icon", type: "text", help: "Lucide icon key, e.g. monitor, landmark." },
      { name: "heroTitle", label: "Hero title", type: "text", help: "Large title on the industry page. Defaults to the name." },
      { name: "heroImage", label: "Hero image", type: "image" },
      { name: "body", label: "Body", type: "richtext" },
      { name: "challenges", label: "Challenges", type: "lines", help: "One challenge per line." },
      { name: "solutions", label: "Solutions", type: "lines", help: "One solution per line." },
      { name: "featured", label: "Featured industry", type: "boolean" },
      { name: "order", label: "Order", type: "number" },
      { name: "status", label: "Status", type: "status", listColumn: true },
      ...baseSeoFields,
    ],
  },
  locations: {
    key: "locations",
    label: "Locations",
    singular: "Location",
    model: Location as unknown as Model<unknown>,
    moduleKey: "locations",
    titleField: "name",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, listColumn: true },
      { name: "slug", label: "Slug", type: "slug", required: true, listColumn: true },
      { name: "type", label: "Type", type: "select", options: ["country", "city", "region"], listColumn: true },
      { name: "countryCode", label: "Country code", type: "text", help: "ISO code, e.g. AE, KW, IN." },
      { name: "excerpt", label: "Excerpt", type: "textarea" },
      { name: "heroTitle", label: "Hero title", type: "text" },
      { name: "heroImage", label: "Hero image", type: "image" },
      { name: "body", label: "Body", type: "richtext" },
      { name: "address", label: "Address", type: "textarea" },
      { name: "phone", label: "Phone", type: "text" },
      { name: "email", label: "Email", type: "text" },
      { name: "coordinates.lat", label: "Latitude", type: "number" },
      { name: "coordinates.lng", label: "Longitude", type: "number" },
      { name: "highlights", label: "Highlights", type: "lines", help: "One highlight per line." },
      { name: "isPrimary", label: "Primary location", type: "boolean", help: "Marks the headquarters / main hub." },
      { name: "order", label: "Order", type: "number" },
      { name: "status", label: "Status", type: "status", listColumn: true },
      ...baseSeoFields,
    ],
  },
  "free-zones": {
    key: "free-zones",
    label: "Free Zones",
    singular: "Free Zone",
    model: FreeZone as unknown as Model<unknown>,
    moduleKey: "free-zones",
    titleField: "name",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, listColumn: true },
      { name: "slug", label: "Slug", type: "slug", required: true, listColumn: true },
      { name: "abbreviation", label: "Abbreviation", type: "text", listColumn: true },
      { name: "excerpt", label: "Excerpt", type: "textarea" },
      { name: "heroTitle", label: "Hero title", type: "text" },
      { name: "heroImage", label: "Hero image", type: "image" },
      { name: "body", label: "Body", type: "richtext" },
      { name: "features", label: "Features", type: "lines", help: "One feature per line." },
      { name: "routes", label: "Routes", type: "lines", help: "One route per line." },
      { name: "order", label: "Order", type: "number" },
      { name: "status", label: "Status", type: "status", listColumn: true },
      ...baseSeoFields,
    ],
  },
  fleet: {
    key: "fleet",
    label: "Fleet",
    singular: "Fleet category",
    model: FleetCategory as unknown as Model<unknown>,
    moduleKey: "fleet",
    titleField: "name",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, listColumn: true },
      { name: "slug", label: "Slug", type: "slug", required: true, listColumn: true },
      { name: "capacityRange", label: "Capacity range", type: "text", listColumn: true, help: "e.g. 1–4 passengers, 50+ passengers." },
      { name: "icon", label: "Icon", type: "text", help: "Lucide icon key, e.g. car, bus." },
      { name: "description", label: "Description", type: "textarea" },
      { name: "image", label: "Image", type: "image" },
      { name: "order", label: "Order", type: "number" },
      { name: "status", label: "Status", type: "status", listColumn: true },
      ...baseSeoFields,
    ],
  },
  "case-studies": {
    key: "case-studies",
    label: "Case Studies",
    singular: "Case study",
    model: CaseStudy as unknown as Model<unknown>,
    moduleKey: "case-studies",
    titleField: "title",
    fields: [
      { name: "title", label: "Title", type: "text", required: true, listColumn: true },
      { name: "slug", label: "Slug", type: "slug", required: true, listColumn: true },
      { name: "client", label: "Client", type: "text", listColumn: true },
      { name: "industry", label: "Industry", type: "text", listColumn: true, help: "e.g. IT / ITES & BPO. Used to group and filter studies." },
      { name: "serviceType", label: "Service type", type: "text", help: "e.g. Employee Shuttle Programme. Used as a secondary filter." },
      { name: "location", label: "Location", type: "text", help: "e.g. Dubai, UAE" },
      { name: "excerpt", label: "Excerpt", type: "textarea", help: "One-line summary shown on cards and the hero." },
      { name: "coverImage", label: "Cover image", type: "image" },
      { name: "logo", label: "Client logo", type: "image", help: "Optional. Shown on the study card and detail header." },
      { name: "fleetSize", label: "Fleet / headcount figure", type: "text", help: "e.g. 24 coaches or 1,800 staff. Shown in the at-a-glance panel." },
      { name: "duration", label: "Programme duration", type: "text", help: "e.g. 6-month rollout, ongoing since 2021." },
      { name: "metrics", label: "Result metrics", type: "keyvalue", help: "Headline outcome figures. Value first (e.g. 99.4%), then label (On-time arrivals)." },
      { name: "challenge", label: "The challenge", type: "textarea", help: "What the client was struggling with before ViaRidez." },
      { name: "services", label: "Services delivered", type: "lines", help: "One service per line. Shown alongside the challenge." },
      { name: "solution", label: "Our solution", type: "textarea", help: "How ViaRidez solved it." },
      { name: "highlights", label: "Solution highlights", type: "lines", help: "One highlight per line. Shown alongside the solution." },
      { name: "result", label: "The result", type: "textarea", help: "The measurable outcome." },
      { name: "body", label: "Extended story (optional)", type: "richtext", help: "Optional Markdown story rendered below the structured blocks." },
      { name: "testimonialQuote", label: "Client quote", type: "textarea", help: "Optional pull-quote from the client." },
      { name: "testimonialAuthor", label: "Quote author", type: "text" },
      { name: "testimonialRole", label: "Quote author role", type: "text", help: "e.g. Head of Admin, Acme FZ LLC" },
      { name: "gallery", label: "Photo gallery", type: "gallery", help: "Optional supporting photos shown in a gallery strip." },
      { name: "tags", label: "Tags", type: "tags" },
      { name: "featured", label: "Featured study", type: "boolean", help: "Featured studies appear in the spotlight at the top of the listing." },
      { name: "order", label: "Order", type: "number" },
      { name: "status", label: "Status", type: "status", listColumn: true },
      ...baseSeoFields,
    ],
  },
  careers: {
    key: "careers",
    label: "Careers",
    singular: "Vacancy",
    model: Career as unknown as Model<unknown>,
    moduleKey: "careers",
    titleField: "title",
    fields: [
      { name: "title", label: "Title", type: "text", required: true, listColumn: true },
      { name: "slug", label: "Slug", type: "slug", required: true, listColumn: true },
      { name: "department", label: "Department", type: "text", listColumn: true },
      { name: "category", label: "Category", type: "text", help: "Used to group / filter roles, e.g. Operations, Technology." },
      { name: "location", label: "Location", type: "text", listColumn: true },
      { name: "employmentType", label: "Employment type", type: "select", options: ["full-time", "part-time", "contract", "internship"], listColumn: true },
      { name: "workMode", label: "Work mode", type: "select", options: ["on-site", "hybrid", "remote"] },
      { name: "experienceLevel", label: "Experience level", type: "select", options: ["entry", "mid", "senior", "lead"] },
      { name: "experienceMin", label: "Min experience (years)", type: "number" },
      { name: "experienceMax", label: "Max experience (years)", type: "number" },
      { name: "openings", label: "Number of openings", type: "number" },
      { name: "salaryDisclosed", label: "Show salary publicly", type: "boolean", help: "Off = show 'Competitive' instead of the range." },
      { name: "salaryMin", label: "Salary min", type: "number" },
      { name: "salaryMax", label: "Salary max", type: "number" },
      { name: "salaryCurrency", label: "Salary currency", type: "text", help: "e.g. AED, USD" },
      { name: "salaryPeriod", label: "Salary period", type: "select", options: ["monthly", "yearly"] },
      { name: "excerpt", label: "Excerpt", type: "textarea", help: "Short summary shown on the job card." },
      { name: "description", label: "Description", type: "richtext" },
      { name: "responsibilities", label: "Responsibilities", type: "lines", help: "One responsibility per line." },
      { name: "requirements", label: "Requirements", type: "lines", help: "One requirement per line." },
      { name: "skills", label: "Skills", type: "tags", help: "Comma-separated key skills used for search." },
      { name: "benefits", label: "Benefits & perks", type: "lines", help: "One benefit per line." },
      { name: "screeningQuestions", label: "Screening questions", type: "lines", help: "One question per line. Applicants must answer each on the apply form." },
      { name: "closingDate", label: "Closing date", type: "date", help: "Leave blank for no deadline." },
      { name: "featured", label: "Featured role", type: "boolean" },
      { name: "status", label: "Status", type: "status", listColumn: true },
      ...baseSeoFields,
    ],
  },
  resources: {
    key: "resources",
    label: "Resources",
    singular: "Resource",
    model: Resource as unknown as Model<unknown>,
    moduleKey: "resources",
    titleField: "title",
    fields: [
      { name: "title", label: "Title", type: "text", required: true, listColumn: true },
      { name: "slug", label: "Slug", type: "slug", required: true, listColumn: true },
      { name: "type", label: "Type", type: "select", options: ["guide", "report", "playbook", "checklist", "case-study"], listColumn: true },
      { name: "excerpt", label: "Excerpt", type: "textarea" },
      { name: "coverImage", label: "Cover image", type: "image" },
      { name: "downloadUrl", label: "Downloadable file", type: "file", required: true, help: "Upload the PDF / DOC / DOCX visitors will download. Stored securely in Cloudinary." },
      { name: "tags", label: "Tags", type: "tags" },
      { name: "order", label: "Order", type: "number" },
      { name: "featured", label: "Featured", type: "boolean" },
      { name: "gated", label: "Gate download behind email", type: "boolean" },
      { name: "status", label: "Status", type: "status", listColumn: true },
      ...baseSeoFields,
    ],
  },
  redirects: {
    key: "redirects",
    label: "Redirects",
    singular: "Redirect",
    model: Redirect as unknown as Model<unknown>,
    moduleKey: "redirects",
    titleField: "source",
    fields: [
      { name: "source", label: "Source path", type: "text", required: true, listColumn: true, help: "e.g. /old-services" },
      { name: "destination", label: "Destination", type: "text", required: true, listColumn: true, help: "Path (/services) or full URL (https://…)" },
      { name: "permanent", label: "Permanent (301/308)", type: "boolean", listColumn: true, help: "On = 308 permanent, off = 307 temporary." },
    ],
  },
}

export function getResource(key: string): ResourceConfig | null {
  return RESOURCES[key] ?? null
}

/**
 * Server-only map resolving a serializable relation `collection` key to its
 * Mongoose model. Kept out of the FieldConfig objects so the config can be
 * safely passed from Server Components into the client form.
 */
const RELATION_MODELS: Record<string, Model<unknown>> = {
  services: Service as unknown as Model<unknown>,
  blogCategories: BlogCategory as unknown as Model<unknown>,
}

/**
 * Loads select options for every `relation` field on a resource so the form
 * can render a real dropdown (e.g. the parent-service or blog-category picker)
 * instead of a raw ObjectId text box.
 */
export async function loadRelationOptions(
  cfg: ResourceConfig,
  recordId?: string,
): Promise<RelationOptions> {
  const out: RelationOptions = {}
  const relationFields = cfg.fields.filter((f) => f.type === "relation" && f.relation)
  if (relationFields.length === 0) return out

  await connectToDatabase()
  for (const field of relationFields) {
    const { collection, labelField, excludeSelf } = field.relation!
    const model = RELATION_MODELS[collection]
    if (!model) continue
    const docs = (await model
      .find({ isDeleted: { $ne: true } })
      .sort({ [labelField]: 1 })
      .lean()) as Record<string, unknown>[]
    out[field.name] = docs
      .filter((d) => !(excludeSelf && recordId && String(d._id) === recordId))
      .map((d) => ({ value: String(d._id), label: String(d[labelField] ?? d._id) }))
  }
  return out
}
