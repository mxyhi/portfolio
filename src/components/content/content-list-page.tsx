import BlurFade from "@/components/magicui/blur-fade";
import {
  getContentSlug,
  getPaginatedContentEntries,
  type ContentEntry,
} from "@/lib/content-entries";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

interface ContentListEntry extends ContentEntry {
  title: string;
}

interface ContentListPageProps<T extends ContentListEntry> {
  entries: readonly T[];
  title: string;
  description: string;
  countLabel: string;
  emptyMessage: string;
  basePath: string;
  pageParam: string | undefined;
  pageSize?: number;
}

const BLUR_FADE_DELAY = 0.04;
const DEFAULT_PAGE_SIZE = 5;

export function ContentListPage<T extends ContentListEntry>({
  entries,
  title,
  description,
  countLabel,
  emptyMessage,
  basePath,
  pageParam,
  pageSize = DEFAULT_PAGE_SIZE,
}: ContentListPageProps<T>) {
  const { items, pagination } = getPaginatedContentEntries(
    entries,
    pageParam,
    pageSize
  );

  return (
    <section id={title.toLowerCase()}>
      <BlurFade delay={BLUR_FADE_DELAY}>
        <h1 className="text-2xl font-semibold tracking-tight mb-2">
          {title}
          <span className="ml-1 bg-card border border-border rounded-md px-2 py-1 text-muted-foreground text-sm">
            {pagination.totalItems} {countLabel}
          </span>
        </h1>
        <p className="text-sm text-muted-foreground mb-8">{description}</p>
      </BlurFade>

      {items.length > 0 ? (
        <>
          <BlurFade delay={BLUR_FADE_DELAY * 2}>
            <div className="flex flex-col gap-5">
              {items.map((entry, index) => {
                const slug = getContentSlug(entry);
                const indexNumber = (pagination.page - 1) * pageSize + index + 1;

                return (
                  <BlurFade
                    delay={BLUR_FADE_DELAY * 3 + index * 0.05}
                    key={slug}
                  >
                    <Link
                      className="flex items-start gap-x-2 group cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                      href={`${basePath}/${slug}`}
                    >
                      <span className="text-xs font-mono tabular-nums font-medium mt-[5px]">
                        {String(indexNumber).padStart(2, "0")}.
                      </span>
                      <div className="flex flex-col gap-y-2 flex-1">
                        <p className="tracking-tight text-lg font-medium">
                          <span className="group-hover:text-foreground transition-colors">
                            {entry.title}
                            <ChevronRight
                              className="ml-1 inline-block size-4 stroke-3 text-muted-foreground opacity-0 -translate-x-2 transition-all duration-200 group-hover:opacity-100 group-hover:translate-x-0"
                              aria-hidden
                            />
                          </span>
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {entry.publishedAt}
                        </p>
                      </div>
                    </Link>
                  </BlurFade>
                );
              })}
            </div>
          </BlurFade>

          {pagination.totalPages > 1 ? (
            <BlurFade delay={BLUR_FADE_DELAY * 4}>
              <div className="flex gap-3 flex-row items-center justify-between mt-8">
                <div className="text-sm text-muted-foreground">
                  Page {pagination.page} of {pagination.totalPages}
                </div>
                <div className="flex gap-2 sm:justify-end">
                  {pagination.hasPreviousPage ? (
                    <Link
                      href={`${basePath}?page=${pagination.page - 1}`}
                      className="h-8 w-fit px-2 flex items-center justify-center text-sm border border-border rounded-lg hover:bg-accent/50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    >
                      Previous
                    </Link>
                  ) : (
                    <span className="h-8 w-fit px-2 flex items-center justify-center text-sm border border-border rounded-lg opacity-50 cursor-not-allowed">
                      Previous
                    </span>
                  )}
                  {pagination.hasNextPage ? (
                    <Link
                      href={`${basePath}?page=${pagination.page + 1}`}
                      className="h-8 w-fit px-2 flex items-center justify-center text-sm border border-border rounded-lg hover:bg-accent/50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    >
                      Next
                    </Link>
                  ) : (
                    <span className="h-8 w-fit px-2 flex items-center justify-center text-sm border border-border rounded-lg opacity-50 cursor-not-allowed">
                      Next
                    </span>
                  )}
                </div>
              </div>
            </BlurFade>
          ) : null}
        </>
      ) : (
        <BlurFade delay={BLUR_FADE_DELAY * 2}>
          <div className="flex flex-col items-center justify-center py-12 px-4 border border-border rounded-xl">
            <p className="text-muted-foreground text-center">{emptyMessage}</p>
          </div>
        </BlurFade>
      )}
    </section>
  );
}
