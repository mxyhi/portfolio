import { MDXContent } from "@content-collections/mdx/react";
import { mdxComponents } from "@/mdx-components";
import {
  getContentNeighbors,
  getContentSlug,
  type ContentEntry,
} from "@/lib/content-entries";
import { resolveContentImageUrl } from "@/lib/content-metadata";
import type { ContentSectionConfig } from "@/lib/content-sections";
import { formatDate } from "@/lib/utils";
import { DATA } from "@/data/resume";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface ContentDetailEntry extends ContentEntry {
  title: string;
  summary: string;
  publishedAt: string;
  mdx: string;
  image?: string;
}

interface ContentDetailPageProps<T extends ContentDetailEntry> {
  entry: T;
  entries: readonly T[];
  section: ContentSectionConfig;
}

export function ContentDetailPage<T extends ContentDetailEntry>({
  entry,
  entries,
  section,
}: ContentDetailPageProps<T>) {
  const { previousEntry, nextEntry } = getContentNeighbors(
    entries,
    getContentSlug(entry)
  );
  const imageUrl =
    resolveContentImageUrl(entry.image) ??
    `${DATA.url}${section.basePath}/${getContentSlug(entry)}/opengraph-image`;

  const jsonLdContent = JSON.stringify({
    "@context": "https://schema.org",
    "@type": section.schemaType,
    headline: entry.title,
    datePublished: entry.publishedAt,
    dateModified: entry.publishedAt,
    description: entry.summary,
    image: imageUrl,
    url: `${DATA.url}${section.basePath}/${getContentSlug(entry)}`,
    author: {
      "@type": "Person",
      name: DATA.name,
    },
  }).replace(/</g, "\\u003c");

  return (
    <section id={titleToId(section.title)}>
      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{
          __html: jsonLdContent,
        }}
      />
      <div className="flex justify-start gap-4 items-center">
        <Link
          href={section.basePath}
          className="text-sm text-muted-foreground hover:text-foreground transition-colors border border-border rounded-lg px-2 py-1 inline-flex items-center gap-1 mb-6 group"
          aria-label={`Back to ${section.title}`}
        >
          <ChevronLeft className="size-3 group-hover:-translate-x-px transition-transform" />
          Back to {section.title}
        </Link>
      </div>
      <div className="flex flex-col gap-4">
        <h1 className="title font-semibold text-3xl md:text-4xl tracking-tighter leading-tight">
          {entry.title}
        </h1>
        <p className="text-sm text-muted-foreground">
          {formatDate(entry.publishedAt)}
        </p>
      </div>
      <div className="my-6 flex w-full items-center">
        <div
          className="flex-1 h-px bg-border"
          style={{
            maskImage:
              "linear-gradient(90deg, transparent, black 8%, black 92%, transparent)",
            WebkitMaskImage:
              "linear-gradient(90deg, transparent, black 8%, black 92%, transparent)",
          }}
        />
      </div>
      <article className="prose max-w-full text-pretty font-sans leading-relaxed text-muted-foreground dark:prose-invert">
        <MDXContent code={entry.mdx} components={mdxComponents} />
      </article>

      <nav className="mt-12 pt-8 max-w-2xl">
        <div className="flex flex-col sm:flex-row justify-between gap-4">
          {previousEntry ? (
            <Link
              href={`${section.basePath}/${getContentSlug(previousEntry)}`}
              className="group flex-1 flex flex-col gap-1 p-4 rounded-lg border border-border hover:bg-accent/50 transition-colors"
            >
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <ChevronLeft className="size-3" />
                Previous
              </span>
              <span className="text-sm font-medium group-hover:text-foreground transition-colors whitespace-normal wrap-break-word">
                {previousEntry.title}
              </span>
            </Link>
          ) : (
            <div className="hidden sm:block flex-1" />
          )}

          {nextEntry ? (
            <Link
              href={`${section.basePath}/${getContentSlug(nextEntry)}`}
              className="group flex-1 flex flex-col gap-1 p-4 rounded-lg border border-border hover:bg-accent/50 transition-colors text-right"
            >
              <span className="flex items-center justify-end gap-1 text-xs text-muted-foreground">
                Next
                <ChevronRight className="size-3" />
              </span>
              <span className="text-sm font-medium group-hover:text-foreground transition-colors whitespace-normal wrap-break-word">
                {nextEntry.title}
              </span>
            </Link>
          ) : (
            <div className="hidden sm:block flex-1" />
          )}
        </div>
      </nav>
    </section>
  );
}

function titleToId(title: string) {
  return title.toLowerCase();
}
