import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import rehypeSlug from "rehype-slug"
import rehypeSanitize, { defaultSchema } from "rehype-sanitize"

/**
 * Sanitize schema extended to keep the `id` attribute that rehype-slug adds to
 * headings (needed for the in-article table of contents anchors) while still
 * stripping anything unsafe from author-supplied Markdown.
 */
const schema = {
  ...defaultSchema,
  attributes: {
    ...defaultSchema.attributes,
    "*": [...(defaultSchema.attributes?.["*"] ?? []), "id"],
  },
}

/**
 * Renders an article body written in Markdown into rich, styled HTML.
 * Server component — no interactivity — so it streams with the page.
 * GFM enables tables, strikethrough and task lists; links open safely in a new
 * tab. Styling comes from the `.article-prose` block in globals.css.
 */
export function ArticleMarkdown({ content }: { content: string }) {
  return (
    <div className="article-prose">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeSlug, [rehypeSanitize, schema]]}
        components={{
          a: ({ href, children, ...props }) => {
            const external = typeof href === "string" && /^https?:\/\//.test(href)
            return (
              <a
                href={href}
                {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                {...props}
              >
                {children}
              </a>
            )
          },
          // eslint-disable-next-line @next/next/no-img-element
          img: ({ src, alt }) => <img src={typeof src === "string" ? src : "/placeholder.svg"} alt={alt ?? ""} loading="lazy" />,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}
